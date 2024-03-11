import { LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Friend } from 'vendors/mezon-js/packages/mezon-js/dist';
import { ensureSession, getMezonCtx } from '../helpers';
import { channelMembersActions } from '../channelmembers/channel.members';
export const FRIEND_FEATURE_KEY = 'friends';

export interface FriendsEntity extends Friend {
	id: string;
}

export interface IFriend extends Friend {
	id: string;
}

export const mapFriendToEntity = (FriendRes: Friend) => {
	return { ...FriendRes, id: FriendRes.user?.id || '' };
};

export interface FriendsState extends EntityState<FriendsEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	currentTabStatus: string;
}

export const friendsAdapter = createEntityAdapter<FriendsEntity>();

export const fetchListFriends = createAsyncThunk('friends/fetchListFriends', async (_, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.listFriends(mezon.session, undefined, 100, '');
	if (!response.friends) {
		return thunkAPI.rejectWithValue([]);
	}
	const listFriends = response.friends.map(mapFriendToEntity);
	const userIds = listFriends.map((friend) => friend.user?.id || '');
	thunkAPI.dispatch(channelMembersActions.addUserIdsToFollow(userIds))
	thunkAPI.dispatch(channelMembersActions.followUserStatus());
	return listFriends
});

export type requestAddFriendParam = {
	ids?: string[];
	usernames?: string[];
};

export const sendRequestAddFriend = createAsyncThunk('friends/requestFriends', async ({ ids, usernames }: requestAddFriendParam, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	await mezon.client
		.addFriends(mezon.session, ids, usernames)
		.catch(function (err) {
			err.json().then((data: any) => {
				toast.error(data.message);
			});
		})
		.then((data) => {
			if (data) {
				thunkAPI.dispatch(friendsActions.fetchListFriends());
			}
		})
		.catch((e) => {
			console.log('error');
		});
});

export const sendRequestDeleteFriend = createAsyncThunk(
	'friends/requestDeleteFriends',
	async ({ ids, usernames }: requestAddFriendParam, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteFriends(mezon.session, ids, usernames);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(friendsActions.fetchListFriends());
		return response;
	},
);

export const sendRequestBlockFriend = createAsyncThunk('friends/requestBlockFriends', async ({ ids, usernames }: requestAddFriendParam, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.blockFriends(mezon.session, ids, usernames);
	console.log(response);
	if (!response) {
		return thunkAPI.rejectWithValue([]);
	}
	thunkAPI.dispatch(friendsActions.fetchListFriends());
	return response;
});

export const initialFriendsState: FriendsState = friendsAdapter.getInitialState({
	loadingStatus: 'not loaded',
	friends: [],
	error: null,
	currentTabStatus: 'all',
});

export const friendsSlice = createSlice({
	name: FRIEND_FEATURE_KEY,
	initialState: initialFriendsState,
	reducers: {
		add: friendsAdapter.addOne,
		remove: friendsAdapter.removeOne,
		changeCurrentStatusTab: (state, action: PayloadAction<string>) => {
			state.currentTabStatus = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchListFriends.pending, (state: FriendsState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchListFriends.fulfilled, (state: FriendsState, action: PayloadAction<IFriend[]>) => {
				friendsAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchListFriends.rejected, (state: FriendsState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
		builder.addCase(sendRequestAddFriend.rejected, (state: FriendsState, action) => {
			state.loadingStatus = 'error';
			state.error = action.error.message ?? 'No valid ID or username was provided.';
		});
	},
});

export const friendsReducer = friendsSlice.reducer;

export const friendsActions = {
	...friendsSlice.actions,
	fetchListFriends,
	sendRequestAddFriend,
	sendRequestDeleteFriend,
	sendRequestBlockFriend,
};

const { selectAll } = friendsAdapter.getSelectors();

export const getFriendsState = (rootState: { [FRIEND_FEATURE_KEY]: FriendsState }): FriendsState => rootState[FRIEND_FEATURE_KEY];
export const selectAllFriends = createSelector(getFriendsState, selectAll);
