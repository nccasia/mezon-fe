import { IUserAccount, LoadingStatus } from '@mezon/utils';
import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import memoize from 'memoizee';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';

export const ACCOUNT_FEATURE_KEY = 'account';
export interface IAccount {
	email: string;
	password: string;
}
export interface AccountState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	account?: IAccount | null;
	userProfile?: IUserAccount | null;
}

export const initialAccountState: AccountState = {
	loadingStatus: 'not loaded',
	account: null,
	userProfile: null,
};

const CHANNEL_PROFILE_CACHED_TIME = 1000 * 60 * 3;
const fetchUserProfileCached = memoize((mezon: MezonValueContext) => mezon.client.getAccount(mezon.session), {
	promise: true,
	maxAge: CHANNEL_PROFILE_CACHED_TIME,
	normalizer: (args) => {
		return args[0].session.username || '';
	},
});

export const getUserProfile = createAsyncThunk<IUserAccount, { noCache: boolean } | void>('account/user', async (arg, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const noCache = arg?.noCache ?? false;
	if (noCache) {
		fetchUserProfileCached.clear(mezon);
	}
	const response = await fetchUserProfileCached(mezon);
	if (!response) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return response;
});

export const accountSlice = createSlice({
	name: ACCOUNT_FEATURE_KEY,
	initialState: initialAccountState,
	reducers: {
		setAccount(state, action) {
			state.account = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getUserProfile.pending, (state: AccountState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(getUserProfile.fulfilled, (state: AccountState, action: PayloadAction<IUserAccount>) => {
				state.userProfile = action.payload;
				state.loadingStatus = 'loaded';
			})
			.addCase(getUserProfile.rejected, (state: AccountState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const accountReducer = accountSlice.reducer;

export const accountActions = { ...accountSlice.actions, getUserProfile };

export const getAccountState = (rootState: { [ACCOUNT_FEATURE_KEY]: AccountState }): AccountState => rootState[ACCOUNT_FEATURE_KEY];

export const selectAllAccount = createSelector(getAccountState, (state: AccountState) => state.userProfile);

export const selectCurrentUserId = createSelector(getAccountState, (state: AccountState) => state?.userProfile?.user?.id || '');
