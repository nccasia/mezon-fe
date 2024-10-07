import { EOverriddenPermission } from '@mezon/utils';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState } from '@reduxjs/toolkit';
import { ApiPermission } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx, MezonValueContext } from '../helpers';
import { memoizeAndTrack } from '../memoize';

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
	noCache?: boolean;
}

/**
 * Fetch highest permission for a channel.
 * These permissions override clan's permissions
 */

export const fetchMaxChannelPermissionCached = memoizeAndTrack(
	async (mezon: MezonValueContext, clanId: string, channelId: string) => {
		const response = await mezon.client.listUserPermissionInChannel(mezon.session, clanId, channelId);
		return { ...response, time: Date.now() };
	},
	{
		promise: true,
		maxAge: 1000 * 60 * 3,
		normalizer: (args) => {
			const username = args[0]?.session?.username || '';
			return args[1] + username;
		}
	}
);

export const fetchMaxChannelPermission = createAsyncThunk(
	`${OVERRIDDEN_POLICIES_FEATURE_KEY}/fetchMaxPermissionRoleChannel`,
	async ({ clanId, channelId, noCache }: FetchMaxPermissionChannelsArgs, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			if (noCache) {
				fetchMaxChannelPermissionCached.clear(mezon, clanId, channelId);
			}
			const response = await fetchMaxChannelPermissionCached(mezon, clanId, channelId);
			if (response && response.permissions?.permissions) {
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
