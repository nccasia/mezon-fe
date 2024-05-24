import { ICategory, IChannel, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import { ApiUpdateChannelDescRequest, ChannelCreatedEvent, ChannelDeletedEvent, ChannelType, ChannelUpdatedEvent } from 'mezon-js';
import { ApiChannelDescription, ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { appActions } from '../app/app.slice';
import { attachmentActions } from '../attachment/attachments.slice';
import { fetchCategories } from '../categories/categories.slice';
import { channelMembersActions } from '../channelmembers/channel.members';
import { MezonValueContext, ensureSession, ensureSocket, getMezonCtx } from '../helpers';
import { messagesActions } from '../messages/messages.slice';
import { threadsActions } from '../threads/threads.slice';
import memoize from 'memoizee';
import { notificationSettingActions } from '../notificationSetting/notificationSettingChannel.slice';


const LIST_CHANNEL_CACHED_TIME = 1000 * 60 * 3;

export const CHANNELS_FEATURE_KEY = 'channels';

/*
 * Update these interfaces according to your requirements.
 */
export interface ChannelsEntity extends IChannel {
	id: string; // Primary ID
}

export const mapChannelToEntity = (channelRes: ApiChannelDescription) => {
	return { ...channelRes, id: channelRes.channel_id || '' };
};

interface ChannelMeta {
	id: string;
	lastSeenTimestamp: number;
	lastSentTimestamp: number;
}

const channelMetaAdapter = createEntityAdapter<ChannelMeta>();

export interface ChannelsState extends EntityState<ChannelsEntity, string> {
	loadingStatus: LoadingStatus;
	socketStatus: LoadingStatus;
	error?: string | null;
	currentChannelId?: string | null;
	isOpenCreateNewChannel?: boolean;
	currentCategory: ICategory | null;
	channelMetadata: EntityState<ChannelMeta, string>;
	currentVoiceChannelId: string;
	valueTextInput: Record<string, string>;
}

export const channelsAdapter = createEntityAdapter<ChannelsEntity>();

export interface ChannelsRootState {
	[CHANNELS_FEATURE_KEY]: ChannelsState;
}

function getChannelsRootState(thunkAPI: GetThunkAPI<unknown>): ChannelsRootState {
	return thunkAPI.getState() as ChannelsRootState;
}

type fetchChannelMembersPayload = {
	clanId: string;
	channelId: string;
	noFetchMembers?: boolean;
};

export const joinChannel = createAsyncThunk(
	'channels/joinChannel',
	async ({ clanId, channelId, noFetchMembers }: fetchChannelMembersPayload, thunkAPI) => {
		try {
			thunkAPI.dispatch(attachmentActions.fetchChannelAttachments({ clanId, channelId }));
			thunkAPI.dispatch(channelsActions.setCurrentChannelId(channelId));
			thunkAPI.dispatch(notificationSettingActions.getNotificationSetting(channelId));
			thunkAPI.dispatch(messagesActions.fetchMessages({ channelId }));
			thunkAPI.dispatch(appActions.setIsShowMemberList(true));
			if (!noFetchMembers) {
				thunkAPI.dispatch(channelMembersActions.fetchChannelMembers({ clanId, channelId, channelType: ChannelType.CHANNEL_TYPE_TEXT }));
			}
			const channel = selectChannelById(channelId)(getChannelsRootState(thunkAPI));
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));

			await mezon.joinChatChannel(channelId);

			return channel;
		} catch (error) {
			console.log(error);
			return thunkAPI.rejectWithValue([]);
		}
	},
);

export const createNewChannel = createAsyncThunk('channels/createNewChannel', async (body: ApiCreateChannelDescRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.createChannelDesc(mezon.session, body);
		if (response) {
			thunkAPI.dispatch(fetchChannels({ clanId: body.clan_id as string, noCache: true }));
			thunkAPI.dispatch(fetchCategories({ clanId: body.clan_id as string }));
			await mezon.joinChatThread(response.channel_id as string);
			if (response.parrent_id !== '0') {
				await thunkAPI.dispatch(
					threadsActions.setListThreadId({ channelId: response.parrent_id as string, threadId: response.channel_id as string }),
				);
			}
			return response;
		} else {
			return thunkAPI.rejectWithValue([]);
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const deleteChannel = createAsyncThunk('channels/deleteChannel', async (body: fetchChannelMembersPayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteChannelDesc(mezon.session, body.channelId);
		if (response) {
			thunkAPI.dispatch(fetchChannels({ clanId: body.clanId, noCache: true}));
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const updateChannel = createAsyncThunk('channels/updateChannel', async (body: ApiUpdateChannelDescRequest,thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.updateChannelDesc(mezon.session, body.channel_id, body);
		const clanID = selectClanId()(getChannelsRootState(thunkAPI)) || '';
		if (response) {
			thunkAPI.dispatch(fetchChannels({ clanId: clanID, noCache: true}));
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

type fetchChannelsArgs = {
	clanId: string;
	cursor?: string;
	limit?: number;
	forward?: number;
	channelType?: number;
	noCache?: boolean;
};

function extractChannelMeta(channel: ChannelsEntity): ChannelMeta {
	return {
		id: channel.id,
		lastSeenTimestamp: Number(channel.last_seen_message?.timestamp || 0),
		lastSentTimestamp: Number(channel.last_sent_message?.timestamp || 0),
	};
}


export const fetchChannelsCached = memoize(
	(mezon: MezonValueContext, limit: number, state: number, clanId: string, channelType: number) =>
		mezon.client.listChannelDescs(mezon.session, limit, state, '', clanId, channelType),
	{
		promise: true,
		maxAge: LIST_CHANNEL_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[2] + args[3] + args[4];
		},
	},
);

export const fetchChannels = createAsyncThunk('channels/fetchChannels', async ({ clanId, channelType = 1, noCache }: fetchChannelsArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));

	if (noCache) {
		fetchChannelsCached.clear(mezon,100,1,clanId, channelType);
	}

	const response = await fetchChannelsCached(mezon, 100, 1, clanId, channelType);

	if (!response.channeldesc) {
		return thunkAPI.rejectWithValue([]);
	}

	const channels = response.channeldesc.map(mapChannelToEntity);
	const meta = channels.map((ch) => extractChannelMeta(ch));
	thunkAPI.dispatch(channelsActions.updateBulkChannelMetadata(meta));

	return channels;
});

export const initialChannelsState: ChannelsState = channelsAdapter.getInitialState({
	loadingStatus: 'not loaded',
	socketStatus: 'not loaded',
	error: null,
	isOpenCreateNewChannel: false,
	currentCategory: null,
	channelMetadata: channelMetaAdapter.getInitialState(),
	currentVoiceChannelId: '',
	valueTextInput: {},
});

export const channelsSlice = createSlice({
	name: CHANNELS_FEATURE_KEY,
	initialState: initialChannelsState,
	reducers: {
		add: channelsAdapter.addOne,
		remove: channelsAdapter.removeOne,
		update: channelsAdapter.updateOne,
		setCurrentChannelId: (state, action: PayloadAction<string>) => {
			state.currentChannelId = action.payload;
		},
		setCurrentVoiceChannelId: (state, action: PayloadAction<string>) => {
			state.currentVoiceChannelId = action.payload;
		},
		openCreateNewModalChannel: (state, action: PayloadAction<boolean>) => {
			state.isOpenCreateNewChannel = action.payload;
		},
		getCurrentCategory: (state, action: PayloadAction<ICategory>) => {
			state.currentCategory = action.payload;
		},
		setChannelLastSentTimestamp: (state, action: PayloadAction<{ channelId: string; timestamp: number }>) => {
			const channel = state.channelMetadata.entities[action.payload.channelId];
			if (channel) {
				channel.lastSentTimestamp = action.payload.timestamp;
			}
		},
		setChannelLastSeenTimestamp: (state, action: PayloadAction<{ channelId: string; timestamp: number }>) => {
			const channel = state.channelMetadata.entities[action.payload.channelId];
			if (channel) {
				channel.lastSeenTimestamp = action.payload.timestamp;
			}
		},
		updateBulkChannelMetadata: (state, action: PayloadAction<ChannelMeta[]>) => {
			state.channelMetadata = channelMetaAdapter.upsertMany(state.channelMetadata, action.payload);
		},
		createChannelSocket: (state, action: PayloadAction<ChannelCreatedEvent>) => {
			const payload = action.payload;
			const channel = mapChannelToEntity({ ...payload, type: payload.channel_type });
			channelsAdapter.addOne(state, channel);
		},
		deleteChannelSocket: (state, action: PayloadAction<ChannelDeletedEvent>) => {
			const payload = action.payload;
			channelsAdapter.removeOne(state, payload.channel_id);
		},
		updateChannelSocket: (state, action: PayloadAction<ChannelUpdatedEvent>) => {
			const payload = action.payload;
			channelsAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: {channel_label: payload.channel_label},
			});
		},
		setValueTextInput: (state, action: PayloadAction<{ channelId: string; value: string }>) => {
			state.valueTextInput[action.payload.channelId] = action.payload.value;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannels.pending, (state: ChannelsState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchChannels.fulfilled, (state: ChannelsState, action: PayloadAction<ChannelsEntity[]>) => {
				channelsAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchChannels.rejected, (state: ChannelsState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});

		builder
			.addCase(joinChannel.rejected, (state: ChannelsState, action) => {
				state.socketStatus = 'error';
				state.error = action.error.message;
			})
			.addCase(joinChannel.pending, (state: ChannelsState) => {
				state.socketStatus = 'loading';
			})
			.addCase(joinChannel.fulfilled, (state: ChannelsState) => {
				state.socketStatus = 'loaded';
			});
		builder
			.addCase(createNewChannel.pending, (state: ChannelsState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(createNewChannel.fulfilled, (state: ChannelsState) => {
				state.loadingStatus = 'loaded';
				state.isOpenCreateNewChannel = false;
			})
			.addCase(createNewChannel.rejected, (state: ChannelsState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});

		builder
			.addCase(deleteChannel.pending, (state: ChannelsState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(deleteChannel.fulfilled, (state: ChannelsState) => {
				state.loadingStatus = 'loaded';
			})
			.addCase(deleteChannel.rejected, (state: ChannelsState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const channelsReducer = channelsSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(channelsActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const { openCreateNewModalChannel } = channelsSlice.actions;

export const channelsActions = {
	...channelsSlice.actions,
	fetchChannels,
	joinChannel,
	createNewChannel,
	deleteChannel,
	updateChannel,
};

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllChannels);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = channelsAdapter.getSelectors();

export const getChannelsState = (rootState: { [CHANNELS_FEATURE_KEY]: ChannelsState }): ChannelsState => rootState[CHANNELS_FEATURE_KEY];

export const selectAllChannels = createSelector(getChannelsState, selectAll);

export const selectChannelsEntities = createSelector(getChannelsState, selectEntities);

export const selectChannelById = (id: string) => createSelector(selectChannelsEntities, (clansEntities) => clansEntities[id] || null);

export const selectCurrentChannelId = createSelector(getChannelsState, (state) => state.currentChannelId);

export const selectEntitiesChannel = createSelector(getChannelsState, (state) => state.entities);

export const selectCurrentVoiceChannelId = createSelector(getChannelsState, (state) => state.currentVoiceChannelId);

export const selectCurrentChannel = createSelector(selectChannelsEntities, selectCurrentChannelId, (clansEntities, clanId) =>
	clanId ? clansEntities[clanId] : null,
);

export const selectClanId = () => createSelector(selectCurrentChannel, (channel) => channel?.clan_id);

export const selectCurrentVoiceChannel = createSelector(selectChannelsEntities, selectCurrentVoiceChannelId, (clansEntities, clanId) =>
	clanId ? clansEntities[clanId] : null,
);

export const selectVoiceChannelAll = createSelector(selectAllChannels, (channels) =>
	channels.filter((channel) => channel.type == ChannelType.CHANNEL_TYPE_VOICE),
);

export const selectChannelFirst = createSelector(selectAllChannels, (channels) => channels[0]);

export const selectChannelSecond = createSelector(selectAllChannels, (channels) => channels[1]);

export const selectChannelsByClanId = (clainId: string) =>
	createSelector(selectAllChannels, (channels) => channels.filter((ch) => ch.clan_id == clainId));

export const selectDefaultChannelIdByClanId = (clainId: string) =>
	createSelector(selectChannelsByClanId(clainId), (channels) => (channels.length > 0 ? channels[0].id : null));

export const selectIsUnreadChannelById = (channelId: string) =>
	createSelector(getChannelsState, (state) => {
		const channel = state.channelMetadata.entities[channelId];
		// unread last seen timestamp is less than last sent timestamp
		return channel?.lastSeenTimestamp < channel?.lastSentTimestamp;
	});

export const selectLastChannelTimestamp = (channelId: string) =>
	createSelector(getChannelsState, (state) => {
		const channel = state.channelMetadata.entities[channelId];
		return channel?.lastSeenTimestamp || 0;
	});

export const selectValueTextInputByChannelId = (channelId: string) =>
	createSelector(getChannelsState, (state) => {
		return state.valueTextInput[channelId];
	});
