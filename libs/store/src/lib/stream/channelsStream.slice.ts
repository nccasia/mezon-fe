import { IChannelsStream, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ensureSession, getMezonCtx } from '../helpers';

export const CHANNELS_STREAM_FEATURE_KEY = 'channelsstream';

/*
 * Update these interfaces according to your requirements.
 */
export interface ChannelsStreamEntity extends IChannelsStream {
	id: string; // Primary ID
}

export interface ChannelsStreamState extends EntityState<ChannelsStreamEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const channelsStreamAdapter = createEntityAdapter({
	selectId: (channel: ChannelsStreamEntity) => channel.id || ''
});

type listStreamChannelsPayload = {
	clanId: string;
};

export const listStreamChannels = createAsyncThunk('stream/listStreamChannels', async ({ clanId }: listStreamChannelsPayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		const response = await mezon.client.listStreamingChannels(mezon.session, clanId);
		if (!response.streaming_channels) {
			return [];
		}
		const channels: ChannelsStreamEntity[] = response.streaming_channels.map((channelRes) => {
			return {
				channel_id: channelRes.channel_id || '',
				clan_id: channelRes.clan_id || '',
				is_streaming: !channelRes.is_streaming,
				streaming_url: channelRes.streaming_url || '',
				id: channelRes.channel_id || ''
			};
		});
		thunkAPI.dispatch(channelsStreamActions.addMany(channels));
		return response.streaming_channels;
	} catch (error: any) {
		const errstream = await error.json();
		return thunkAPI.rejectWithValue(errstream.message);
	}
});

export const initialChannelsStreamState: ChannelsStreamState = channelsStreamAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null
});

export const channelsStreamSlice = createSlice({
	name: CHANNELS_STREAM_FEATURE_KEY,
	initialState: initialChannelsStreamState,
	reducers: {
		add: channelsStreamAdapter.addOne,
		addMany: channelsStreamAdapter.addMany,
		remove: channelsStreamAdapter.removeOne
		// ...
	},
	extraReducers: (builder) => {
		builder
			.addCase(listStreamChannels.pending, (state: ChannelsStreamState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(listStreamChannels.fulfilled, (state: ChannelsStreamState, action: PayloadAction<any>) => {
				// state.listStreamChannel = action.payload;
				state.loadingStatus = 'loaded';
			})
			.addCase(listStreamChannels.rejected, (state: ChannelsStreamState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/*
 * Export reducer for store configuration.
 */
export const channelsStreamReducer = channelsStreamSlice.reducer;

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
export const channelsStreamActions = {
	...channelsStreamSlice.actions,
	listStreamChannels
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
const { selectAll, selectById, selectEntities } = channelsStreamAdapter.getSelectors();

export const getChannelsStreamState = (rootState: { [CHANNELS_STREAM_FEATURE_KEY]: ChannelsStreamState }): ChannelsStreamState =>
	rootState[CHANNELS_STREAM_FEATURE_KEY];

export const selectAllChannelsStream = createSelector(getChannelsStreamState, selectAll);

export const selectChannelsStreamEntities = createSelector(getChannelsStreamState, selectEntities);

export const selectStreamChannelByChannelId = (channelId: string) => createSelector(getChannelsStreamState, (state) => selectById(state, channelId));

// export const selectStreamChannelByChannelId = (channelId: string) =>
// 	createSelector(selectChannelsStreamEntities, (entities) => {
// 		const channelMembers = Object.values(entities);
// 		return channelMembers.filter((channel) => channel && channel.channel_id === channelId);
// 	});
