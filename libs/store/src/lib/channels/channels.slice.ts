import { ChannelType } from '@mezon/mezon-js';
import { ApiChannelDescription, ApiCreateChannelDescRequest } from '@mezon/mezon-js/dist/api.gen';
import { ICategory, IChannel, LoadingStatus, UnreadChannel } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import { fetchCategories } from '../categories/categories.slice';
import { channelMembersActions } from '../channelmembers/channel.members';
import { ensureSession, ensureSocket, getMezonCtx } from '../helpers';
import { messagesActions } from '../messages/messages.slice';

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

export interface ChannelsState extends EntityState<ChannelsEntity, string> {
	loadingStatus: LoadingStatus;
	socketStatus: LoadingStatus;
	error?: string | null;
	currentChannelId?: string | null;
	isOpenCreateNewChannel?: boolean;
	currentCategory: ICategory | null;
	// newChannelCreatedId: string | undefined;
	arrayUnreadChannel: UnreadChannel[];
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
			thunkAPI.dispatch(channelsActions.setCurrentChannelId(channelId));
			thunkAPI.dispatch(messagesActions.fetchMessages({ channelId }));
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
			thunkAPI.dispatch(fetchChannels({ clanId: body.clan_id as string }));
			thunkAPI.dispatch(fetchCategories({ clanId: body.clan_id as string }));
			return response;
		} else {
			return thunkAPI.rejectWithValue([]);
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
};

export const fetchChannels = createAsyncThunk('channels/fetchChannels', async ({ clanId, channelType = 1 }: fetchChannelsArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.listChannelDescs(mezon.session, 100, 1, '', clanId, channelType);

	if (!response.channeldesc) {
		return thunkAPI.rejectWithValue([]);
	}

	const channels = response.channeldesc.map(mapChannelToEntity);
	thunkAPI.dispatch(channelsActions.setArrayUnreadChannel(channels));

	return channels;
});

export const initialChannelsState: ChannelsState = channelsAdapter.getInitialState({
	loadingStatus: 'not loaded',
	socketStatus: 'not loaded',
	error: null,
	isOpenCreateNewChannel: false,
	currentCategory: null,
	arrayUnreadChannel: [],
});

export const channelsSlice = createSlice({
	name: CHANNELS_FEATURE_KEY,
	initialState: initialChannelsState,
	reducers: {
		add: channelsAdapter.addOne,
		remove: channelsAdapter.removeOne,
		setCurrentChannelId: (state, action: PayloadAction<string>) => {
			state.currentChannelId = action.payload;
		},
		openCreateNewModalChannel: (state, action: PayloadAction<boolean>) => {
			state.isOpenCreateNewChannel = action.payload;
		},
		getCurrentCategory: (state, action: PayloadAction<ICategory>) => {
			state.currentCategory = action.payload;
		},
		setArrayUnreadChannel: (state, action: PayloadAction<ApiChannelDescription[]>) => {
			const channels = action.payload;
			state.arrayUnreadChannel = channels.map((item) => ({
				channelId: item.channel_id ?? '',
				channelLastSentMessageId: item.last_sent_message?.id ?? '',
				channelLastSeenMesageId: item.last_seen_message?.id ?? '',
				timestamp: item.last_seen_message?.timestamp ?? '',
			}));
		},
		setChannelLastSeenMessageId: (state, action: PayloadAction<{ channelId: string; channelLastSentMessageId: string }>) => {
			const { channelId, channelLastSentMessageId } = action.payload;
			state.arrayUnreadChannel.forEach((item) => {
				if (item.channelId === channelId) {
					item.channelLastSentMessageId = channelLastSentMessageId;
				}
			});
		},
		setChannelSeenLastSeenMessageId: (state, action: PayloadAction<{ channelId: string; channelLastSeenMesageId: string }>) => {
			const { channelId, channelLastSeenMesageId } = action.payload;
			state.arrayUnreadChannel.forEach((item) => {
				if (item.channelId === channelId) {
					item.channelLastSeenMesageId = channelLastSeenMesageId;
				}
			});
		},
		setTimestamp: (state, action: PayloadAction<{ channelId: string; timestamp: string }>) => {
			const { channelId, timestamp } = action.payload;
			state.arrayUnreadChannel.forEach((item) => {
				if (item.channelId === channelId) {
					item.timestamp = timestamp;
				}
			});
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

export const selectArrayUnreadChannel = createSelector(getChannelsState, (state) => state.arrayUnreadChannel);

export const selectEntitiesChannel = createSelector(getChannelsState, (state) => state.entities);

export const selectCurrentChannel = createSelector(selectChannelsEntities, selectCurrentChannelId, (clansEntities, clanId) =>
	clanId ? clansEntities[clanId] : null,
);

export const selectChannelsByClanId = (clainId: string) =>
	createSelector(selectAllChannels, (channels) => channels.filter((ch) => ch.clan_id == clainId));

export const selectDefaultChannelIdByClanId = (clainId: string) =>
	createSelector(selectChannelsByClanId(clainId), (channels) => (channels.length > 0 ? channels[0].id : null));
