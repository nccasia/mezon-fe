import { EOverriddenPermission } from '@mezon/utils';
import { EntityState, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiPermission } from 'mezon-js/api.gen';
import { ensureSocket, getMezonCtx } from '../helpers';

export const OVERRIDDEN_POLICIES_FEATURE_KEY = 'overriddenPolicies';

export interface ChannelPermission {
	channelId: string;
	maxPermissions: Record<EOverriddenPermission, ApiPermission>;
}

export type OverriddenPermissionState = {
	channelPermissions: EntityState<ChannelPermission, string>;
};

const overriddenPermissionAdapter = createEntityAdapter({
	selectId: (overriddenPolicy: ChannelPermission) => overriddenPolicy.channelId
});

const initialState: OverriddenPermissionState = {
	channelPermissions: overriddenPermissionAdapter.getInitialState()
};

const overriddenPoliciesSlice = createSlice({
	name: OVERRIDDEN_POLICIES_FEATURE_KEY,
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchMaxChannelPermission.fulfilled, (state, action) => {
			overriddenPermissionAdapter.upsertOne(state?.channelPermissions, action.payload);
		});
	}
});

// ============== Public APIs ============
interface FetchMaxPermissionChannelsArgs {
	channelId: string;
	clanId: string;
}

/**
 * Fetch highest permission for a channel.
 * These permissions override clan's permissions
 */
export const fetchMaxChannelPermission = createAsyncThunk(
	`${OVERRIDDEN_POLICIES_FEATURE_KEY}/fetchMaxPermissionRoleChannel`,
	async ({ clanId, channelId }: FetchMaxPermissionChannelsArgs, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const response = await mezon.socketRef.current?.listUserPermissionInChannel(clanId, channelId);
			if (response && response.permissions.permissions) {
				return {
					channelId,
					maxPermissions: response.permissions.permissions.reduce<Record<EOverriddenPermission, ApiPermission>>(
						(acc, perm) => {
							if (perm.slug) {
								acc[perm.slug as EOverriddenPermission] = perm;
							}
							return acc;
						},
						{} as Record<EOverriddenPermission, ApiPermission>
					)
				};
			}
			return thunkAPI.rejectWithValue(null);
		} catch (error) {
			return thunkAPI.rejectWithValue(null);
		}
	}
);

export const overriddenPoliciesReducer = overriddenPoliciesSlice.reducer;

export const overriddenPoliciesActions = {
	...overriddenPoliciesSlice.actions,
	fetchMaxChannelPermission
};

export const selectOverriddenPoliciesState = (state: { [OVERRIDDEN_POLICIES_FEATURE_KEY]: OverriddenPermissionState }) =>
	state[OVERRIDDEN_POLICIES_FEATURE_KEY];

const maxChannelPermissionsAdapters = overriddenPermissionAdapter.getSelectors();

export const selectAllChannelsWithMaxPermissionEntities = createSelector(selectOverriddenPoliciesState, (state) =>
	maxChannelPermissionsAdapters.selectEntities(state?.channelPermissions)
);
export const selectMaxPermissionForChannel = (channelId: string) =>
	createSelector(selectAllChannelsWithMaxPermissionEntities, (permissionEntities) => {
		const channelPermissions = permissionEntities[channelId]?.maxPermissions;
		const permissionsMap = {} as Record<EOverriddenPermission, boolean>;
		for (const permission in channelPermissions) {
			const isActive = Boolean(channelPermissions[permission as EOverriddenPermission]?.active);
			permissionsMap[permission as EOverriddenPermission] = isActive;
		}
		return permissionsMap;
	});
