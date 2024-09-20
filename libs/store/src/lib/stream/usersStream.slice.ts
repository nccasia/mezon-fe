import { IChannelMember, IUserStream, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ChannelType } from 'mezon-js';
import { ensureSession, getMezonCtx } from '../helpers';

export const USERS_STREAM_FEATURE_KEY = 'usersstream';

/*
 * Update these interfaces according to your requirements.
 */
export interface UsersStreamEntity extends IUserStream {
	id: string; // Primary ID
}

export interface UsersStreamState extends EntityState<UsersStreamEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	streamChannelMember: IChannelMember[];
}

export const userStreamAdapter = createEntityAdapter<UsersStreamEntity>();

type fetchStreamChannelMembersPayload = {
	clanId: string;
	channelId: string;
	channelType: ChannelType;
};

export const fetchStreamChannelMembers = createAsyncThunk(
	'stream/fetchStreamChannelMembers',
	async ({ clanId, channelId, channelType }: fetchStreamChannelMembersPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		const response = await mezon.client.listStreamingChannelUsers(mezon.session, clanId, channelId, channelType, 1, 100, '');
		if (!response.streaming_channel_users) {
			return [];
		}

		const members = response.streaming_channel_users.map((channelRes) => {
			return {
				user_id: channelRes.user_id || '',
				clan_id: clanId,
				streaming_channel_id: channelRes.channel_id || '',
				clan_name: '',
				participant: channelRes.participant || '',
				streaming_channel_label: '',
				id: channelRes.id || ''
			};
		});

		thunkAPI.dispatch(usersStreamActions.addMany(members));
		const streams = response.streaming_channel_users;
		return streams;
	}
);

export const initialUsersStreamState: UsersStreamState = userStreamAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	streamChannelMember: []
});

export const usersStreamSlice = createSlice({
	name: USERS_STREAM_FEATURE_KEY,
	initialState: initialUsersStreamState,
	reducers: {
		add: userStreamAdapter.addOne,
		addMany: userStreamAdapter.addMany,
		remove: userStreamAdapter.removeOne
		// ...
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchStreamChannelMembers.pending, (state: UsersStreamState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchStreamChannelMembers.fulfilled, (state: UsersStreamState, action: PayloadAction<any>) => {
				state.streamChannelMember = action.payload;
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchStreamChannelMembers.rejected, (state: UsersStreamState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/*
 * Export reducer for store configuration.
 */
export const usersStreamReducer = usersStreamSlice.reducer;

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
 *   dispatch(usersActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const usersStreamActions = {
	...usersStreamSlice.actions,
	fetchStreamChannelMembers
};

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllUsers);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = userStreamAdapter.getSelectors();

export const getUsersStreamState = (rootState: { [USERS_STREAM_FEATURE_KEY]: UsersStreamState }): UsersStreamState =>
	rootState[USERS_STREAM_FEATURE_KEY];

export const selectAllUsersStream = createSelector(getUsersStreamState, selectAll);

export const selectUsersStreamEntities = createSelector(getUsersStreamState, selectEntities);

export const selectStreamMembersByChannelId = (channelId: string) =>
	createSelector(selectUsersStreamEntities, (entities) => {
		const streamMembers = Object.values(entities);
		return streamMembers.filter((member) => member && member.streaming_channel_id === channelId);
	});
