import { ApiChannelMessageHeaderWithChannel, ICategory, IChannel, LoadingStatus, ModeResponsive, RequestInput } from '@mezon/utils';
import { EntityState, GetThunkAPI, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/browser';
import memoize from 'memoizee';
import { ApiUpdateChannelDescRequest, ChannelCreatedEvent, ChannelDeletedEvent, ChannelType, ChannelUpdatedEvent } from 'mezon-js';
import { ApiChangeChannelPrivateRequest, ApiChannelDescription, ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { fetchCategories } from '../categories/categories.slice';
import { channelMembersActions } from '../channelmembers/channel.members';
import { directActions } from '../direct/direct.slice';
import { MezonValueContext, ensureSession, ensureSocket, getMezonCtx } from '../helpers';
import { messagesActions } from '../messages/messages.slice';
import { notificationActions } from '../notification/notify.slice';
import { notifiReactMessageActions } from '../notificationSetting/notificationReactMessage.slice';
import { notificationSettingActions } from '../notificationSetting/notificationSettingChannel.slice';
import { pinMessageActions } from '../pinMessages/pinMessage.slice';
import { rolesClanActions } from '../roleclan/roleclan.slice';
import { threadsActions } from '../threads/threads.slice';

const LIST_CHANNEL_CACHED_TIME = 1000 * 60 * 3;

export const CHANNELS_FEATURE_KEY = 'channels';

/*
 * Update these interfaces according to your requirements.
 */
export interface ChannelsEntity extends IChannel {
	id: string; // Primary ID
}

export const mapChannelToEntity = (channelRes: ApiChannelDescription) => {
	return { ...channelRes, id: channelRes.channel_id || '', status: channelRes.meeting_code ? 1 : 0 };
};

interface ChannelMeta {
	id: string;
	lastSeenTimestamp: number;
	lastSentTimestamp: number;
	lastSeenPinMessage: string;
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
	request: Record<string, RequestInput>;
	idChannelSelected: Record<string, string>;
	modeResponsive: ModeResponsive.MODE_CLAN | ModeResponsive.MODE_DM;
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
	messageId?: string;
	isDmGroup?: boolean;
};

type JoinChatPayload = {
	clanId: string;
	channelId: string;
	channelType: number;
};

export const joinChat = createAsyncThunk('channels/joinChat', async ({ clanId, channelId, channelType }: JoinChatPayload, thunkAPI) => {
	try {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));
		const channel = await mezon.socketRef.current?.joinChat(clanId, channelId, channelType);
		return channel;
	} catch (error) {
		Sentry.captureException(error);
		return thunkAPI.rejectWithValue({ error });
	}
});

export const joinChannel = createAsyncThunk(
	'channels/joinChannel',
	async ({ clanId, channelId, noFetchMembers, messageId }: fetchChannelMembersPayload, thunkAPI) => {
		try {
			thunkAPI.dispatch(channelsActions.setIdChannelSelected({ clanId, channelId }));
			thunkAPI.dispatch(channelsActions.setCurrentChannelId(channelId));
			thunkAPI.dispatch(notificationSettingActions.getNotificationSetting({ channelId }));
			thunkAPI.dispatch(notifiReactMessageActions.getNotifiReactMessage({ channelId }));

			if (messageId) {
				thunkAPI.dispatch(messagesActions.jumpToMessage({ channelId, messageId }));
			} else {
				thunkAPI.dispatch(messagesActions.fetchMessages({ channelId, isFetchingLatestMessages: true }));
			}

			if (!noFetchMembers) {
				thunkAPI.dispatch(channelMembersActions.fetchChannelMembers({ clanId, channelId, channelType: ChannelType.CHANNEL_TYPE_TEXT }));
			}
			thunkAPI.dispatch(pinMessageActions.fetchChannelPinMessages({ channelId: channelId }));
			const channel = selectChannelById(channelId)(getChannelsRootState(thunkAPI));
			thunkAPI.dispatch(channelsActions.setModeResponsive(ModeResponsive.MODE_CLAN));

			return channel;
		} catch (error) {
			console.log(error);
			return thunkAPI.rejectWithValue([]);
		}
	}
);

export const createNewChannel = createAsyncThunk('channels/createNewChannel', async (body: ApiCreateChannelDescRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.createChannelDesc(mezon.session, body);
		if (response) {
			thunkAPI.dispatch(fetchChannels({ clanId: body.clan_id as string, noCache: true }));
			thunkAPI.dispatch(fetchCategories({ clanId: body.clan_id as string }));
			if (response.type !== ChannelType.CHANNEL_TYPE_VOICE) {
				thunkAPI.dispatch(
					channelsActions.joinChat({
						clanId: response.clan_id as string,
						channelId: response.channel_id as string,
						channelType: response.type as number
					})
				);
			}
			if (response.parrent_id !== '0') {
				await thunkAPI.dispatch(
					threadsActions.setListThreadId({ channelId: response.parrent_id as string, threadId: response.channel_id as string })
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
			if (body.isDmGroup) {
				return true;
			}
			thunkAPI.dispatch(fetchChannels({ clanId: body.clanId, noCache: true }));
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const updateChannel = createAsyncThunk('channels/updateChannel', async (body: ApiUpdateChannelDescRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.updateChannelDesc(mezon.session, body.channel_id, body);
		const clanID = selectClanId()(getChannelsRootState(thunkAPI)) || '';
		if (response) {
			if (body.category_id === '0') {
				thunkAPI.dispatch(directActions.fetchDirectMessage({ noCache: true }));
			} else {
				thunkAPI.dispatch(fetchChannels({ clanId: clanID, noCache: true }));
			}
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const updateChannelPrivate = createAsyncThunk('channels/updateChannelPrivate', async (body: ApiChangeChannelPrivateRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.updateChannelPrivate(mezon.session, body);
		const clanID = selectClanId()(getChannelsRootState(thunkAPI)) || '';
		if (response) {
			thunkAPI.dispatch(fetchChannels({ clanId: clanID, noCache: true }));
			thunkAPI.dispatch(rolesClanActions.fetchRolesClan({ clanId: clanID, channelId: body.channel_id }));
			thunkAPI.dispatch(
				channelMembersActions.fetchChannelMembers({
					clanId: clanID,
					channelId: body.channel_id || '',
					noCache: true,
					channelType: ChannelType.CHANNEL_TYPE_TEXT
				})
			);
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
		lastSeenTimestamp: Number(channel.last_seen_message?.timestamp_seconds),
		lastSentTimestamp: Number(channel.last_sent_message?.timestamp_seconds),
		lastSeenPinMessage: channel.last_pin_message || ''
	};
}

export const fetchChannelsCached = memoize(
	async (mezon: MezonValueContext, limit: number, state: number, clanId: string, channelType: number) => {
		const response = await mezon.client.listChannelDescs(mezon.session, limit, state, '', clanId, channelType);
		return { ...response, time: Date.now() };
	},
	{
		promise: true,
		maxAge: LIST_CHANNEL_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[2] + args[3] + args[4] + args[0].session.username;
		}
	}
);

export const fetchChannels = createAsyncThunk(
	'channels/fetchChannels',
	async ({ clanId, channelType = ChannelType.CHANNEL_TYPE_TEXT, noCache }: fetchChannelsArgs, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		if (noCache) {
			fetchChannelsCached.clear(mezon, 500, 1, clanId, channelType);
		}
		const response = await fetchChannelsCached(mezon, 500, 1, clanId, channelType);
		if (!response.channeldesc) {
			return [];
		}

		if (Date.now() - response.time < 100) {
			const lastSeenTimeStampInit = response.channeldesc
				.filter((channel) => channel.type === ChannelType.CHANNEL_TYPE_TEXT)
				.map((channelText) => {
					return {
						channelId: channelText.channel_id ?? '',
						lastSeenTimeStamp: Number(channelText.last_seen_message?.timestamp_seconds || 0),
						clanId: channelText.clan_id ?? ''
					};
				});
			thunkAPI.dispatch(notificationActions.setAllLastSeenTimeStampChannelThunk(lastSeenTimeStampInit));

			const lastChannelMessages =
				response.channeldesc?.map((channel) => ({
					...channel.last_sent_message,
					channel_id: channel.channel_id
				})) ?? [];

			const lastChannelMessagesTruthy = lastChannelMessages.filter((message) => message);

			thunkAPI.dispatch(messagesActions.setManyLastMessages(lastChannelMessagesTruthy as ApiChannelMessageHeaderWithChannel[]));
		}

		const channels = response.channeldesc.map(mapChannelToEntity);
		const meta = channels.map((ch) => extractChannelMeta(ch));
		thunkAPI.dispatch(channelsActions.updateBulkChannelMetadata(meta));
		return channels;
	}
);

export const initialChannelsState: ChannelsState = channelsAdapter.getInitialState({
	loadingStatus: 'not loaded',
	socketStatus: 'not loaded',
	error: null,
	isOpenCreateNewChannel: false,
	currentCategory: null,
	channelMetadata: channelMetaAdapter.getInitialState(),
	currentVoiceChannelId: '',
	request: {},
	idChannelSelected: JSON.parse(localStorage.getItem('remember_channel') || '{}'),
	modeResponsive: ModeResponsive.MODE_DM,
	quantityNotifyChannels: {}
});

export const channelsSlice = createSlice({
	name: CHANNELS_FEATURE_KEY,
	initialState: initialChannelsState,
	reducers: {
		add: channelsAdapter.addOne,
		removeAll: channelsAdapter.removeAll,
		remove: channelsAdapter.removeOne,
		update: channelsAdapter.updateOne,
		removeByChannelID: (state, action: PayloadAction<string>) => {
			channelsAdapter.removeOne(state, action.payload);
		},
		setModeResponsive: (state, action) => {
			state.modeResponsive = action.payload;
		},
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
		setChannelLastSeenPinMessage: (state, action: PayloadAction<{ channelId: string; lastSeenPinMess: string }>) => {
			const channel = state.channelMetadata.entities[action.payload.channelId];
			if (channel) {
				channel.lastSeenPinMessage = action.payload.lastSeenPinMess;
			}
		},
		updateBulkChannelMetadata: (state, action: PayloadAction<ChannelMeta[]>) => {
			state.channelMetadata = channelMetaAdapter.upsertMany(state.channelMetadata, action.payload);
		},
		createChannelSocket: (state, action: PayloadAction<ChannelCreatedEvent>) => {
			const payload = action.payload;
			if (payload.channel_private !== 1) {
				const channel = mapChannelToEntity({ ...payload, type: payload.channel_type });
				channelsAdapter.addOne(state, channel);
			}
		},
		deleteChannelSocket: (state, action: PayloadAction<ChannelDeletedEvent>) => {
			const payload = action.payload;
			channelsAdapter.removeOne(state, payload.channel_id);
		},
		updateChannelSocket: (state, action: PayloadAction<ChannelUpdatedEvent>) => {
			const payload = action.payload;
			channelsAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: {
					channel_label: payload.channel_label,
					status: payload.status
				}
			});
		},
		updateChannelThreadSocket: (state, action) => {
			const payload = action.payload;
			channelsAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: {
					last_sent_message: payload
				}
			});
		},
		updateChannelPrivateSocket: (state, action: PayloadAction<ChannelUpdatedEvent>) => {
			const payload = action.payload;
			const entity = state.entities[payload.channel_id];
			let channelPrivate: number;
			if (entity) {
				if (entity.channel_private && entity.channel_private === 1) {
					channelPrivate = 0;
				} else {
					channelPrivate = 1;
				}
			} else {
				channelPrivate = 1;
			}
			channelsAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: {
					channel_private: channelPrivate
				}
			});
		},
		setRequestInput: (state, action: PayloadAction<{ channelId: string; request: RequestInput }>) => {
			state.request[action.payload.channelId] = action.payload.request;
		},
		setIdChannelSelected: (state, action: PayloadAction<{ clanId: string; channelId: string }>) => {
			state.idChannelSelected[action.payload.clanId] = action.payload.channelId;
			localStorage.setItem('remember_channel', JSON.stringify(state.idChannelSelected));
		}
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
	}
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
	joinChat,
	createNewChannel,
	deleteChannel,
	updateChannel,
	updateChannelPrivate
};

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
import { channel } from 'process';
import { mess } from '@mezon/store';
import { remove } from '@mezon/mobile-components';
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

export const selectModeResponsive = createSelector(getChannelsState, (state) => state.modeResponsive);

export const selectCurrentVoiceChannelId = createSelector(getChannelsState, (state) => state.currentVoiceChannelId);

export const selectCurrentChannel = createSelector(selectChannelsEntities, selectCurrentChannelId, (clansEntities, clanId) =>
	clanId ? clansEntities[clanId] : null
);

export const selectClanId = () => createSelector(selectCurrentChannel, (channel) => channel?.clan_id);

export const selectCurrentVoiceChannel = createSelector(selectChannelsEntities, selectCurrentVoiceChannelId, (clansEntities, clanId) =>
	clanId ? clansEntities[clanId] : null
);

export const selectVoiceChannelAll = createSelector(selectAllChannels, (channels) =>
	channels.filter((channel) => channel.type === ChannelType.CHANNEL_TYPE_VOICE)
);

export const selectChannelFirst = createSelector(selectAllChannels, (channels) => channels[0]);

export const selectChannelSecond = createSelector(selectAllChannels, (channels) => channels[1]);

export const selectChannelsByClanId = (clainId: string) =>
	createSelector(selectAllChannels, (channels) => channels.filter((ch) => ch.clan_id == clainId));

export const selectDefaultChannelIdByClanId = (clanId: string, categories?: string[]) =>
	createSelector(selectChannelsByClanId(clanId), (channels) => {
		const idsSelectedChannel = JSON.parse(localStorage.getItem('remember_channel') || '{}');
		if (idsSelectedChannel && idsSelectedChannel[clanId]) {
			const selectedChannel = channels.find((channel) => channel.channel_id === idsSelectedChannel[clanId]);
			if (selectedChannel) {
				return selectedChannel.id;
			}
		}

		if (categories) {
			for (const category of categories) {
				const filteredChannel = channels.find(
					(channel) => channel.parrent_id === '0' && channel.type === ChannelType.CHANNEL_TYPE_TEXT && channel.category_id === category
				);
				if (filteredChannel) {
					return filteredChannel.id;
				}
			}
		}

		const defaultChannel = channels.find((channel) => channel.parrent_id === '0' && channel.type === ChannelType.CHANNEL_TYPE_TEXT);

		return defaultChannel ? defaultChannel.id : null;
	});

export const selectLastSeenPinMessageChannelById = (channelId: string) =>
	createSelector(getChannelsState, (state) => {
		const channel = state.channelMetadata.entities[channelId];
		return channel?.lastSeenPinMessage || '';
	});

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

export const selectRequestByChannelId = (channelId: string) =>
	createSelector(getChannelsState, (state) => {
		return state.request?.[channelId];
	});

export const selectIdChannelSelectedByClanId = (clanId: string) =>
	createSelector(getChannelsState, (state) => {
		return state.idChannelSelected[clanId];
	});

export const selectAllIdChannelSelected = createSelector(getChannelsState, (state) => state.idChannelSelected);
