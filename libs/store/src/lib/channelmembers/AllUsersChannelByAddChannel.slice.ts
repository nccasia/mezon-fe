import { LoadingStatus } from '@mezon/utils';
import { EntityState, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { USERS_CLANS_FEATURE_KEY, UsersClanState } from '../clanMembers/clan.members';
import { ensureSocket, getMezonCtx } from '../helpers';
import { ChannelMembersEntity } from './channel.members';

export const ALL_USERS_BY_ADD_CHANNEL = 'allUsersByAddChannel';

export interface UsersByAddChannelState extends EntityState<string, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const UserChannelAdapter = createEntityAdapter({
	selectId: (userId: string) => userId || ''
});

export const initialUserChannelState: UsersByAddChannelState = UserChannelAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null
});

export const fetchUserChannels = createAsyncThunk(
	'allUsersByAddChannel/fetchUserChannels',
	async ({ channelId }: { channelId: string }, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const response = await mezon.socketRef.current?.listUsersAddChannelByChannelId(channelId, 500);

			if (response) {
				return response ?? [];
			}
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);

export const userChannelsSlice = createSlice({
	name: ALL_USERS_BY_ADD_CHANNEL,
	initialState: initialUserChannelState,
	reducers: {
		add: UserChannelAdapter.addOne,
		remove: UserChannelAdapter.removeOne,
		update: UserChannelAdapter.updateOne,
		removeMany: UserChannelAdapter.removeMany
	},
	extraReducers(builder) {
		builder
			.addCase(fetchUserChannels.fulfilled, (state: UsersByAddChannelState, actions) => {
				state.loadingStatus = 'loaded';
				if (actions.payload?.user_ids) {
					UserChannelAdapter.setAll(state, actions.payload.user_ids);
				} else {
					state.error = 'No data received';
				}
			})
			.addCase(fetchUserChannels.pending, (state: UsersByAddChannelState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchUserChannels.rejected, (state: UsersByAddChannelState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const userChannelsActions = {
	...userChannelsSlice.actions,
	fetchUserChannels
};

export const userChannelsReducer = userChannelsSlice.reducer;

const getUsersClanState = (rootState: { [USERS_CLANS_FEATURE_KEY]: UsersClanState }): UsersClanState => rootState[USERS_CLANS_FEATURE_KEY];
export const getUserChannelsState = (rootState: { [ALL_USERS_BY_ADD_CHANNEL]: UsersByAddChannelState }): UsersByAddChannelState =>
	rootState[ALL_USERS_BY_ADD_CHANNEL];
const { selectAll } = UserChannelAdapter.getSelectors();
export const selectAllUserIdChannels = createSelector(getUserChannelsState, selectAll);

export const selectAllUserChannel = createSelector([selectAllUserIdChannels, getUsersClanState], (channelMembers, usersClanState) => {
	let membersOfChannel: ChannelMembersEntity[] = [];

	if (!usersClanState?.ids?.length) return membersOfChannel;

	const members = { ids: channelMembers };

	if (!members?.ids) return membersOfChannel;
	const ids = members.ids || [];
	membersOfChannel = ids.map((id) => ({
		...usersClanState.entities[id]
	}));

	return membersOfChannel;
});
