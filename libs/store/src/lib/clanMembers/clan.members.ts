import { IUsersClan, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ClanUserListClanUser } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';
export const USERS_CLANS_FEATURE_KEY = 'usersClan';

/*
 * Update these interfaces according to your requirements.
 */

export interface UsersClanEntity extends IUsersClan {
	id: string; // Primary ID
}

export const mapUsersClanToEntity = (UsersClanRes: ClanUserListClanUser) => {
	const id = (UsersClanRes as unknown as any).user.id;
	return { ...UsersClanRes, id };
};

export interface UsersClanState extends EntityState<UsersClanEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const UsersClanAdapter = createEntityAdapter<UsersClanEntity>();

type UsersClanPayload = {
	clanId: string;
};
export const fetchUsersClan = createAsyncThunk('UsersClan/fetchUsersClan', async ({ clanId }: UsersClanPayload, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.listClanUsers(mezon.session, clanId);
	if (!response.clan_users) {
		return [];
	}
	return response.clan_users.map(mapUsersClanToEntity);
});

export const initialUsersClanState: UsersClanState = UsersClanAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null
});

export const UsersClanSlice = createSlice({
	name: USERS_CLANS_FEATURE_KEY,
	initialState: initialUsersClanState,
	reducers: {
		add: UsersClanAdapter.addOne,
		remove: UsersClanAdapter.removeOne,
		updateUserClan: (state, action: PayloadAction<{ userId: string; clanNick: string; clanAvt: string }>) => {
			const { userId, clanNick, clanAvt } = action.payload;
			UsersClanAdapter.updateOne(state, {
				id: userId,
				changes: {
					clan_nick: clanNick,
					clan_avatar: clanAvt
				}
			});
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUsersClan.pending, (state: UsersClanState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchUsersClan.fulfilled, (state: UsersClanState, action: PayloadAction<IUsersClan[]>) => {
				UsersClanAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})

			.addCase(fetchUsersClan.rejected, (state: UsersClanState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/*
 * Export reducer for store configuration.
 */
export const usersClanReducer = UsersClanSlice.reducer;
export const usersClanActions = { ...UsersClanSlice.actions, fetchUsersClan };

const { selectAll, selectById } = UsersClanAdapter.getSelectors();

export const getUsersClanState = (rootState: { [USERS_CLANS_FEATURE_KEY]: UsersClanState }): UsersClanState => rootState[USERS_CLANS_FEATURE_KEY];

export const selectAllUserClans = createSelector(getUsersClanState, selectAll);

export const selectMemberClanByUserId = (userId: string) => createSelector(getUsersClanState, (state) => selectById(state, userId));

export const selectMemberClanByGoogleId = (googleId: string) =>
	createSelector(selectAllUserClans, (members) => {
		return members.find((member) => member.user?.google_id === googleId);
	});

export const selectMembersClanByUserIds = (userIds: string[]) =>
	createSelector(selectAllUserClans, (members) => {
		return members.filter((member) => {
			const userId = member?.user?.id;
			return userId && userIds.includes(userId);
		});
	});
