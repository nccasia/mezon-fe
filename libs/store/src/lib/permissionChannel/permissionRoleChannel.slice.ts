import { IPermissionRoleChannel, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { PermissionRoleChannel } from 'mezon-js';
import { ApiPermission, ApiPermissionUpdate } from 'mezon-js/api.gen';
import { ensureSession, ensureSocket, getMezonCtx } from '../helpers';

export const LIST_PERMISSION_ROLE_CHANNEL_FEATURE_KEY = 'listpermissionroleschannel';

/*
 * Update these interfaces according to your requirements.
 */
export interface PermissionRoleChannelsEntity extends IPermissionRoleChannel {
	id: string; // Primary ID
}

export const mapPermissionRoleChannelToEntity = (permission: PermissionRoleChannel, channelId: string, roleId: string) => {
	const id = `${channelId}${roleId}${permission.permission_id}`;
	return { ...permission, id, channel_id: channelId, role_id: roleId };
};

export interface PermissionRoleChannelState extends EntityState<PermissionRoleChannelsEntity, string> {
	loadingStatus: LoadingStatus;
	channelPermissions: ApiPermission[];
	error?: string | null;
}

export const permissionRoleChannelAdapter = createEntityAdapter<PermissionRoleChannelsEntity>();

type fetchChannelsArgs = {
	channelId: string;
	roleId: string;
	userId: string;
};

export const fetchPermissionRoleChannel = createAsyncThunk(
	'permissionrolechannel/fetchPermissionRoleChannel',
	async ({ channelId, roleId, userId }: fetchChannelsArgs, thunkAPI) => {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));

		const response = await mezon.socketRef.current?.getPermissionByRoleIdChannelId(roleId, channelId, userId);
		if (!response?.permission_role_channel) {
			return [];
		}
		return response.permission_role_channel.map((permission) => mapPermissionRoleChannelToEntity(permission, channelId, roleId));
	}
);

export type SetPermissionRoleChannel = {
	channelId: string;
	roleId: string;
	permission: Array<ApiPermissionUpdate>;
	maxPermissionId: string;
	userId: string;
};

export const setPermissionRoleChannel = createAsyncThunk(
	'permissionrolechannel/setPermissionRoleChannel',
	async ({ channelId, roleId, permission, maxPermissionId, userId }: SetPermissionRoleChannel, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const body = {
				channel_id: channelId,
				role_id: roleId,
				permission_update: permission,
				max_permission_id: maxPermissionId,
				user_id: userId
			};
			const response = await mezon.client.setRoleChannelPermission(mezon.session, body);
			if (response) {
				await thunkAPI.dispatch(fetchPermissionRoleChannel({ channelId: channelId, roleId: roleId, userId: userId }));
			}
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);

export const initialPermissionRoleChannelState: PermissionRoleChannelState = permissionRoleChannelAdapter.getInitialState({
	loadingStatus: 'not loaded',
	channelPermissions: [],
	error: null
});

export const permissionRoleChannelSlice = createSlice({
	name: LIST_PERMISSION_ROLE_CHANNEL_FEATURE_KEY,
	initialState: initialPermissionRoleChannelState,
	reducers: {
		add: permissionRoleChannelAdapter.addOne,
		removeAll: permissionRoleChannelAdapter.removeAll,
		remove: permissionRoleChannelAdapter.removeOne,
		update: permissionRoleChannelAdapter.updateOne,
		setMaxPermissionChannel: (state, action: PayloadAction<ApiPermission[]>) => {
			state.channelPermissions = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPermissionRoleChannel.pending, (state: PermissionRoleChannelState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(
				fetchPermissionRoleChannel.fulfilled,
				(state: PermissionRoleChannelState, action: PayloadAction<PermissionRoleChannelsEntity[]>) => {
					permissionRoleChannelAdapter.setAll(state, action.payload);
					state.loadingStatus = 'loaded';
				}
			)
			.addCase(fetchPermissionRoleChannel.rejected, (state: PermissionRoleChannelState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/*
 * Export reducer for store configuration.
 */
export const permissionRoleChannelReducer = permissionRoleChannelSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(channelsActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */

export const permissionRoleChannelActions = {
	...permissionRoleChannelSlice.actions,
	fetchPermissionRoleChannel,
	// fetchMaxPermissionRoleChannel,
	setPermissionRoleChannel
};

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
import { channel } from 'process';
import { mess } from '@mezon/store';
 *
 * // ...
 *
 * const entities = useSelector(selectAllChannels);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = permissionRoleChannelAdapter.getSelectors();

export const getPermissionRoleChannelState = (rootState: {
	[LIST_PERMISSION_ROLE_CHANNEL_FEATURE_KEY]: PermissionRoleChannelState;
}): PermissionRoleChannelState => rootState[LIST_PERMISSION_ROLE_CHANNEL_FEATURE_KEY];

export const selectAllPermissionRoleChannel = createSelector(getPermissionRoleChannelState, selectAll);

export const selectPermissionRoleChannelsEntities = createSelector(getPermissionRoleChannelState, selectEntities);

export const selectPermissionByChannelId = (channelId: string) =>
	createSelector(selectAllPermissionRoleChannel, (permissions) => {
		return permissions.filter((p) => (p as any).channel_id === channelId);
	});
