import { ApiPermission } from 'mezon-js/api.gen';
import { IPermissionUser, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ensureSession, getMezonCtx } from '../helpers';
import { ThunkConfigWithError } from '../errors';
import { withError } from '../errors/helpers';

export const POLICIES_FEATURE_KEY = 'policies';

/*
 * Update these interfaces according to your requirements.
 */

export interface PermissionUserEntity extends IPermissionUser {
	id: string; // Primary ID
}

export const mapPermissionUserToEntity = (PermissionsUserRes: ApiPermission) => {
	const id = (PermissionsUserRes as unknown as any).id;
	return { ...PermissionsUserRes, id };
};

export interface PoliciesState extends EntityState<PermissionUserEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	PermissionsUserId?: string | null;
}

export const policiesAdapter = createEntityAdapter<PermissionUserEntity>();

type fetchPermissionsUserPayload = {
	clanId: string;
};

export const fetchPermissionsUser = createAsyncThunk<any, fetchPermissionsUserPayload, ThunkConfigWithError>('policies/fetchPermissionsUser', async ({ clanId }: fetchPermissionsUserPayload, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.GetPermissionOfUserInTheClan(mezon.session, clanId);
	if (!response.permissions) {
		return [];
	}
	return response.permissions.map(mapPermissionUserToEntity);
});

export const fetchPermission = createAsyncThunk(
	'policies/fetchPermission',
	async (_,thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.getListPermission(mezon.session);
		if (!response.permissions) {
			return [];
		}
		return response.permissions?.map(mapPermissionUserToEntity);
	},
);


export const initialPoliciesState: PoliciesState = policiesAdapter.getInitialState({
	loadingStatus: 'not loaded',
	PermissionsUser: [],
	error: null,
});

export const policiesSlice = createSlice({
	name: POLICIES_FEATURE_KEY,
	initialState: initialPoliciesState,
	reducers: {
		add: policiesAdapter.addOne,
		remove: policiesAdapter.removeOne,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPermissionsUser.pending, (state: PoliciesState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchPermissionsUser.fulfilled, (state: PoliciesState, action: PayloadAction<IPermissionUser[]>) => {
				policiesAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})

			.addCase(fetchPermissionsUser.rejected, (state: PoliciesState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
			
	},
});


export const policiesDefaultSlice = createSlice({
	name: "policiesDefaultSlice",
	initialState: initialPoliciesState,
	reducers: {
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPermission.fulfilled, (state: PoliciesState, action: PayloadAction<IPermissionUser[]>) => {
				policiesAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			
	},
});
/*
 * Export reducer for store configuration.
 */
export const policiesReducer = policiesSlice.reducer;

export const policiesDefaultReducer = policiesDefaultSlice.reducer;

export const policiesActions = { ...policiesSlice.actions, fetchPermissionsUser, fetchPermission };

const { selectAll } = policiesAdapter.getSelectors();

export const getPoliciesState = (rootState: { [POLICIES_FEATURE_KEY]: PoliciesState }): PoliciesState => rootState[POLICIES_FEATURE_KEY];

export const selectAllPermissionsUser = createSelector(getPoliciesState, selectAll);

export const getPoliciesDefaultState = (rootState: { ["policiesDefaultSlice"]: PoliciesState }): PoliciesState => rootState["policiesDefaultSlice"];

export const selectAllPermissionsDefault = createSelector(getPoliciesDefaultState, selectAll);

export const selectAllPermissionsUserKey = createSelector(selectAllPermissionsUser, (permissionsUser) => {
	return permissionsUser.map((permissionUser) => permissionUser.slug);
});

