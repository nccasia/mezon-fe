import { IChannelUser, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ChannelDescription } from 'mezon-js';
import { ensureSocket, getMezonCtx } from '../helpers';

export const LIST_CHANNELS_USER_FEATURE_KEY = 'listchannelbyusers';

/*
 * Update these interfaces according to your requirements.
 */
export interface ChannelUsersEntity extends IChannelUser {
	id: string; // Primary ID
}

export const mapChannelsByUserToEntity = (channelRes: ChannelDescription) => {
	return { ...channelRes, id: channelRes.channel_id || '', status: channelRes.meeting_code ? 1 : 0 };
};

export interface ListChannelsByUserState extends EntityState<ChannelUsersEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const listChannelsByUserAdapter = createEntityAdapter<ChannelUsersEntity>();

export interface ListChannelsByUserRootState {
	[LIST_CHANNELS_USER_FEATURE_KEY]: ListChannelsByUserState;
}

export const fetchListChannelsByUser = createAsyncThunk('channelsByUser/fetchListChannelsByUser', async (_, thunkAPI) => {
	const mezon = await ensureSocket(getMezonCtx(thunkAPI));

	const response = await mezon.socketRef.current?.listChannelByUserId();
	if (!response?.channeldesc) {
		return [];
	}

	const channels = response.channeldesc.map(mapChannelsByUserToEntity);
	return channels;
});

export const initialListChannelsByUserState: ListChannelsByUserState = listChannelsByUserAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null
});

export const listChannelsByUserSlice = createSlice({
	name: LIST_CHANNELS_USER_FEATURE_KEY,
	initialState: initialListChannelsByUserState,
	reducers: {
		add: listChannelsByUserAdapter.addOne,
		removeAll: listChannelsByUserAdapter.removeAll,
		remove: listChannelsByUserAdapter.removeOne,
		update: listChannelsByUserAdapter.updateOne,
		updateLastSentTime: (state, action: PayloadAction<{ channelId: string }>) => {
			const payload = action.payload;
			const timestamp = Date.now() / 1000;
			listChannelsByUserAdapter.updateOne(state, {
				id: payload.channelId,
				changes: {
					last_sent_message: {
						timestamp_seconds: timestamp
					}
				}
			});
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchListChannelsByUser.pending, (state: ListChannelsByUserState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchListChannelsByUser.fulfilled, (state: ListChannelsByUserState, action: PayloadAction<ChannelUsersEntity[]>) => {
				listChannelsByUserAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchListChannelsByUser.rejected, (state: ListChannelsByUserState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/*
 * Export reducer for store configuration.
 */
export const listchannelsByUserReducer = listChannelsByUserSlice.reducer;

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

export const listChannelsByUserActions = {
	...listChannelsByUserSlice.actions,
	fetchListChannelsByUser
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
const { selectAll } = listChannelsByUserAdapter.getSelectors();

export const getChannelsByUserState = (rootState: { [LIST_CHANNELS_USER_FEATURE_KEY]: ListChannelsByUserState }): ListChannelsByUserState =>
	rootState[LIST_CHANNELS_USER_FEATURE_KEY];

export const selectAllChannelsByUser = createSelector(getChannelsByUserState, selectAll);

export const selectAllInfoChannels = createSelector(selectAllChannelsByUser, (channels = []) =>
	channels?.map(({ channel_id, channel_label, channel_private, clan_name, clan_id, type, parrent_id, meeting_code, id }) => ({
		channel_id,
		channel_label,
		channel_private,
		clan_name,
		clan_id,
		type,
		parrent_id,
		meeting_code,
		id
	}))
);
