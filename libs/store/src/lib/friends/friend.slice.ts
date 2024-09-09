/* eslint-disable prefer-const */
import { LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import memoize from 'memoizee';
import { Friend } from 'mezon-js';
import { toast } from 'react-toastify';
import { usersClanActions } from '../clanMembers/clan.members';
import { ensureSession, getMezonCtx, MezonValueContext } from '../helpers';

export const FRIEND_FEATURE_KEY = 'friends';
const LIST_FRIEND_CACHED_TIME = 1000 * 60 * 3;

export interface FriendsEntity extends Friend {
	id: string;
}

export interface IFriend extends Friend {
	id: string;
}

interface IStatusSentMobile {
	isSuccess: boolean;
}

export type StateFriendProps = {
	noFriend: boolean;
	myPendingFriend: boolean;
	otherPendingFriend: boolean;
	blockFriend: boolean;
	friend: boolean;
};

export const mapFriendToEntity = (FriendRes: Friend) => {
	return { ...FriendRes, id: FriendRes.user?.id || '' };
};

export interface FriendsState extends EntityState<FriendsEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	currentTabStatus: string;
	statusSentMobile: IStatusSentMobile | null;
}

export const friendsAdapter = createEntityAdapter<FriendsEntity>();

export const fetchListFriendsCached = memoize(
	(mezon: MezonValueContext, state: number, limit: number, cursor: string) =>
		mezon.client.listFriends(mezon.session, state === -1 ? undefined : state, limit, cursor),
	{
		promise: true,
		maxAge: LIST_FRIEND_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[2] + args[3] + args[0].session.username;
		}
	}
);

type fetchListFriendsArgs = {
	noCache?: boolean;
};

export const fetchListFriends = createAsyncThunk('friends/fetchListFriends', async ({ noCache }: fetchListFriendsArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	if (noCache) {
		fetchListFriendsCached.clear(mezon, -1, 100, '');
	}
	const response = await fetchListFriendsCached(mezon, -1, 100, '');
	if (!response.friends) {
		return [];
	}
	const onlineStatus = response.friends.map((friend) => {
		return { userId: friend.user?.id ?? '', status: friend.user?.online ?? false };
	});
	const listFriends = response.friends.map(mapFriendToEntity);
	thunkAPI.dispatch(usersClanActions.setManyStatusUser(onlineStatus));
	return listFriends;
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
				thunkAPI.dispatch(
					friendsActions.setSentStatusMobile({
						isSuccess: false
					})
				);
				toast.error(data.message);
			});
		})
		.then((data) => {
			if (data) {
				thunkAPI.dispatch(
					friendsActions.setSentStatusMobile({
						isSuccess: true
					})
				);
				thunkAPI.dispatch(friendsActions.fetchListFriends({ noCache: true }));
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
		thunkAPI.dispatch(friendsActions.fetchListFriends({ noCache: true }));
		return response;
	}
);

export const sendRequestBlockFriend = createAsyncThunk('friends/requestBlockFriends', async ({ ids, usernames }: requestAddFriendParam, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.blockFriends(mezon.session, ids, usernames);
	if (!response) {
		return thunkAPI.rejectWithValue([]);
	}
	thunkAPI.dispatch(friendsActions.fetchListFriends({}));
	return response;
});

export const initialFriendsState: FriendsState = friendsAdapter.getInitialState({
	loadingStatus: 'not loaded',
	friends: [],
	error: null,
	currentTabStatus: 'all',
	statusSentMobile: null
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
		setSentStatusMobile: (state, action: PayloadAction<IStatusSentMobile | null>) => {
			state.statusSentMobile = action.payload;
		}
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
	}
});

export const friendsReducer = friendsSlice.reducer;

export const friendsActions = {
	...friendsSlice.actions,
	fetchListFriends,
	sendRequestAddFriend,
	sendRequestDeleteFriend,
	sendRequestBlockFriend
};

const { selectAll } = friendsAdapter.getSelectors();

export const getFriendsState = (rootState: { [FRIEND_FEATURE_KEY]: FriendsState }): FriendsState => rootState[FRIEND_FEATURE_KEY];
export const selectAllFriends = createSelector(getFriendsState, selectAll);
export const selectStatusSentMobile = createSelector(getFriendsState, (state) => state.statusSentMobile);

export const selectFriendStatus = (userID: string) =>
	createSelector(selectAllFriends, (friends) => {
		let status: StateFriendProps = {
			noFriend: false,
			otherPendingFriend: false,
			myPendingFriend: false,
			blockFriend: false,
			friend: false
		};

		const friend = friends.find((friend) => friend.id === userID);

		if (friend) {
			switch (friend.state) {
				case 0:
					status.friend = true;
					break;
				case 1:
					status.otherPendingFriend = true;
					break;
				case 2:
					status.myPendingFriend = true;
					break;
				case 3:
					status.blockFriend = true;
					break;
				default:
					status.noFriend = true;
					break;
			}
		} else {
			status.noFriend = true;
		}

		return status;
	});
