import { ChannelStatusEnum, ChannelTypeEnum, IChannel, LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { channelsActions } from '../channels/channels.slice';
import { messagesActions } from '../messages/messages.slice';
import { channelMembersActions } from '../channelmembers/channel.members';
import { ensureSession, ensureSocket, getMezonCtx } from '../helpers';
import { ApiChannelDescription, ApiCreateChannelDescRequest } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';
import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import { string } from 'yup';
import { friendsActions } from '../friends/friend.slice';
import { toast } from 'react-toastify';

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

export const createNewDirectMessage = createAsyncThunk('channels/createNewChannel', async (body: ApiCreateChannelDescRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.createChannelDesc(mezon.session, body);
		if (response) {
			thunkAPI.dispatch(directActions.fetchDirectMessage({ clanId: '', channelType: ChannelTypeEnum.DM_CHAT | ChannelTypeEnum.GROUP_CHAT }));
			thunkAPI.dispatch(directActions.selectDmGroupCurrentId(response.channel_id ?? ''));
			return response;
		} else {
			return thunkAPI.rejectWithValue([]);
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

type fetchDmGroupArgs = {
	clanId: string;
	cursor?: string;
	limit?: number;
	forward?: number;
	channelType?: number;
};

export const fetchDirectMessage = createAsyncThunk('channels/fetchChannels', async ({ clanId, channelType }: fetchDmGroupArgs, thunkAPI) => {
	thunkAPI.dispatch(friendsActions.fetchListFriends());
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.listChannelDescs(mezon.session, 100, 1, '', clanId, channelType);
	if (!response.channeldesc) {
		return thunkAPI.rejectWithValue([]);
	}
	const channels = response.channeldesc.map(mapDmGroupToEntity);
	return channels;
});

interface JoinDirectMessagePayload {
	directMessageId: string;
	channelName?: string;
	type?: number;
}

export const joinDirectMessage = createAsyncThunk<void, JoinDirectMessagePayload>(
	'directMessage/joinDirectMessage',
	async ({ directMessageId, channelName, type }, thunkAPI) => {
		try {
			thunkAPI.dispatch(directActions.selectDmGroupCurrentId(directMessageId));
			thunkAPI.dispatch(messagesActions.fetchMessages({ channelId: directMessageId }));
			thunkAPI.dispatch(channelMembersActions.fetchChannelMembers({ channelId: directMessageId }));
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
		selectDmGroupCurrentId: (state, action: PayloadAction<string>) => {
			state.currentDirectMessageId = action.payload;
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
				toast.error(state.error)
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

export const selectDmGroupCurrent = (dmId: string) => createSelector(selectDirectMessageEntities, (channelEntities) => channelEntities[dmId]);
