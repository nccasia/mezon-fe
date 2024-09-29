import { LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiPermission } from 'mezon-js/api.gen';
import { ensureSocket, getMezonCtx } from '../helpers';

export const MAX_PERMISSION_ROLE_CHANNEL_FEATURE_KEY = 'maxpermissionrolechannel';

export interface MaxPermissionRoleChannelState extends EntityState<ApiPermission, string> {
	loadingStatus: LoadingStatus;
	channelPermissions: ApiPermission[];
	error?: string | null;
}

const maxPermissionRoleChannelAdapter = createEntityAdapter({
	selectId: (permission: ApiPermission) => permission.id || ''
});

type FetchMaxPermissionChannelsArgs = {
	channelId: string;
	clanId: string;
};

/**
 * @deprecated use overriddenPolicies instead
 */
export const fetchMaxPermissionRoleChannel = createAsyncThunk(
	'permissionrolechannel/fetchMaxPermissionRoleChannel',
	async ({ clanId, channelId }: FetchMaxPermissionChannelsArgs, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const response = await mezon.socketRef.current?.listUserPermissionInChannel(clanId, channelId);
			if (response && response.permissions.permissions) {
				await thunkAPI.dispatch(maxPermissionRoleChannelActions.setMaxPermissionChannel(response.permissions.permissions));
				return response?.permissions.permissions;
			}
			return thunkAPI.rejectWithValue([]);
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);

const initialMaxPermissionRoleChannelState: MaxPermissionRoleChannelState = maxPermissionRoleChannelAdapter.getInitialState({
	loadingStatus: 'not loaded',
	channelPermissions: [],
	error: null
});

/**
 * @deprecated use overriddenPolicies instead
 */
export const maxPermissionRoleChannelSlice = createSlice({
	name: MAX_PERMISSION_ROLE_CHANNEL_FEATURE_KEY,
	initialState: initialMaxPermissionRoleChannelState,
	reducers: {
		add: maxPermissionRoleChannelAdapter.addOne,
		removeAll: maxPermissionRoleChannelAdapter.removeAll,
		remove: maxPermissionRoleChannelAdapter.removeOne,
		update: maxPermissionRoleChannelAdapter.updateOne,
		setMaxPermissionChannel: (state, action: PayloadAction<ApiPermission[]>) => {
			state.channelPermissions = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMaxPermissionRoleChannel.pending, (state: MaxPermissionRoleChannelState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchMaxPermissionRoleChannel.fulfilled, (state: MaxPermissionRoleChannelState, action) => {
				maxPermissionRoleChannelAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchMaxPermissionRoleChannel.rejected, (state: MaxPermissionRoleChannelState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/**
 * @deprecated use overriddenPolicies instead
 */
export const maxPermissionRoleChannelReducer = maxPermissionRoleChannelSlice.reducer;

export const maxPermissionRoleChannelActions = {
	...maxPermissionRoleChannelSlice.actions,
	fetchMaxPermissionRoleChannel
};

const { selectAll } = maxPermissionRoleChannelAdapter.getSelectors();

/**
 * @deprecated use overriddenPolicies instead
 * @param rootState
 * @returns
 */
export const getMaxPermissionRoleChannelState = (rootState: {
	[MAX_PERMISSION_ROLE_CHANNEL_FEATURE_KEY]: MaxPermissionRoleChannelState;
}): MaxPermissionRoleChannelState => rootState[MAX_PERMISSION_ROLE_CHANNEL_FEATURE_KEY];

/**
 * @deprecated use overriddenPolicies instead
 */
export const selectAllMaxPermissionRoleChannel = createSelector(getMaxPermissionRoleChannelState, selectAll);
