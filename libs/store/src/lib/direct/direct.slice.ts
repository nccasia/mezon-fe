import { IChannel, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ChannelMessageEvent, ChannelType } from 'mezon-js';
import { ApiChannelDescription, ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { channelMembersActions } from '../channelmembers/channel.members';
import { fetchChannelsCached } from '../channels/channels.slice';
import { friendsActions } from '../friends/friend.slice';
import { ensureSession, ensureSocket, getMezonCtx } from '../helpers';
import { messagesActions } from '../messages/messages.slice';

export const DIRECT_FEATURE_KEY = 'direct';

export interface DirectEntity extends IChannel {
	id: string;
}

export interface DirectState extends EntityState<DirectEntity, string> {
	loadingStatus: LoadingStatus;
	socketStatus: LoadingStatus;
	error?: string | null;
	currentDirectMessageId?: string | null;
}

export interface DirectRootState {
	[DIRECT_FEATURE_KEY]: DirectState;
}

export const directAdapter = createEntityAdapter<DirectEntity>();

export const mapDmGroupToEntity = (channelRes: ApiChannelDescription) => {
	return { ...channelRes, id: channelRes.channel_id || '' };
};

export const createNewDirectMessage = createAsyncThunk('direct/createNewDirectMessage', async (body: ApiCreateChannelDescRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.createChannelDesc(mezon.session, body);
		if (response) {
			thunkAPI.dispatch(directActions.fetchDirectMessage({}));
			thunkAPI.dispatch(directActions.setDmGroupCurrentId(response.channel_id ?? ''));
			return response;
		} else {
			return thunkAPI.rejectWithValue([]);
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

type fetchDmGroupArgs = {
	cursor?: string;
	limit?: number;
	forward?: number;
	channelType?: number;
};

export const fetchDirectMessage = createAsyncThunk('direct/fetchDirectMessage', async ({ channelType = 2 }: fetchDmGroupArgs, thunkAPI) => {
	thunkAPI.dispatch(friendsActions.fetchListFriends({}));
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await fetchChannelsCached(mezon, 100, 1, '', channelType);
	
	if (!response.channeldesc) {
		return thunkAPI.rejectWithValue([]);
	}
	const sorted = response.channeldesc.sort((a: ApiChannelDescription, b: ApiChannelDescription) => {
		if (
			a === undefined ||
			b === undefined ||
			a.last_sent_message === undefined ||
			a.last_seen_message?.id === undefined ||
			b.last_sent_message === undefined ||
			b.last_seen_message?.id === undefined
		) {
			return 0;
		}
		if (a.last_sent_message.id && b.last_sent_message.id && (a.last_sent_message.id < b.last_sent_message.id)) {
			return 1;
		}

		return -1;
	});
	const channels = sorted.map(mapDmGroupToEntity);

	return channels;
});

interface JoinDirectMessagePayload {
	directMessageId: string;
	channelName?: string;
	type?: number;
}

export const joinDirectMessage = createAsyncThunk<void, JoinDirectMessagePayload>(
	'direct/joinDirectMessage',
	async ({ directMessageId, channelName, type }, thunkAPI) => {
		try {
			thunkAPI.dispatch(directActions.setDmGroupCurrentId(directMessageId));
			thunkAPI.dispatch(messagesActions.fetchMessages({ channelId: directMessageId }));
			thunkAPI.dispatch(
				channelMembersActions.fetchChannelMembers({ clanId: '', channelId: directMessageId, channelType: ChannelType.CHANNEL_TYPE_TEXT }),
			);
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			await mezon.joinChatDirectMessage(directMessageId, channelName, type);
			return;
		} catch (error) {
			console.log(error);
			return thunkAPI.rejectWithValue([]);
		}
	},
);

export const initialDirectState: DirectState = directAdapter.getInitialState({
	loadingStatus: 'not loaded',
	socketStatus: 'not loaded',
	error: null,
});

export const directSlice = createSlice({
	name: DIRECT_FEATURE_KEY,
	initialState: initialDirectState,
	reducers: {
		add: directAdapter.addOne,
		remove: directAdapter.removeOne,
		setDmGroupCurrentId: (state, action: PayloadAction<string>) => {
			state.currentDirectMessageId = action.payload;
		},
		updateDMSocket: (state, action: PayloadAction<ChannelMessageEvent>) => {
			const payload = action.payload;
			const timestamp = (Date.now() / 1000).toString();
			directAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: { last_sent_message: { 
					content: payload.content,
					id: payload.id,
					sender_id: payload.sender_id,
					timestamp: timestamp, 
				} },
			});
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchDirectMessage.pending, (state: DirectState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchDirectMessage.fulfilled, (state: DirectState, action: PayloadAction<IChannel[]>) => {
				directAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchDirectMessage.rejected, (state: DirectState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

export const directReducer = directSlice.reducer;

export const directActions = {
	...directSlice.actions,
	fetchDirectMessage,
	createNewDirectMessage,
	joinDirectMessage,
};

const { selectAll, selectEntities } = directAdapter.getSelectors();

export const getDirectState = (rootState: { [DIRECT_FEATURE_KEY]: DirectState }): DirectState => rootState[DIRECT_FEATURE_KEY];
export const selectDirectMessageEntities = createSelector(getDirectState, selectEntities);

export const selectAllDirectMessages = createSelector(getDirectState, selectAll);
export const selectDmGroupCurrentId = createSelector(getDirectState, (state) => state.currentDirectMessageId);

export const selectIsLoadDMData = createSelector(getDirectState, (state) => state.loadingStatus !== 'not loaded');

export const selectDmGroupCurrent = (dmId: string) => createSelector(selectDirectMessageEntities, (channelEntities) => channelEntities[dmId]);
