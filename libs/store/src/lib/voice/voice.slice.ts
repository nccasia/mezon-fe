import { IChannelMember, IVoice, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ChannelType } from '@mezon/mezon-js';
import { ensureSession, getMezonCtx } from '../helpers';

export const VOICE_FEATURE_KEY = 'voice';

/*
 * Update these interfaces according to your requirements.
 */
export interface VoiceEntity extends IVoice {
	id: string; // Primary ID
}

export interface VoiceState extends EntityState<VoiceEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;	
	voiceChannelMember: IChannelMember[];
}

export const voiceAdapter = createEntityAdapter<VoiceEntity>();

type fetchVoiceChannelMembersPayload = {
	clanId: string;
	channelId: string;
	channelType: ChannelType;
};

export const fetchVoiceChannelMembers = createAsyncThunk('voice/fetchVoiceChannelMembers',
	async ({ clanId, channelId, channelType }: fetchVoiceChannelMembersPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		const response = await mezon.client.listChannelVoiceUsers(mezon.session, clanId, channelId, channelType, 1, 100, '');
		if (!response.voice_channel_users) {
			return thunkAPI.rejectWithValue([]);
		}

		const members = response.voice_channel_users.map((channelRes) => {			
			return {
				user_id: channelRes.user_id || '',
				clan_id: clanId,			
				voice_channel_id: channelRes.channel_id || '',
				clan_name: "",
				participant: "",
				voice_channel_label: "",
				last_screenshot: "",
				id: channelRes.jid || ""
			};
		});

		thunkAPI.dispatch(voiceActions.addMany(members));
		return response.voice_channel_users;
	},
);

export const initialVoiceState: VoiceState = voiceAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,	
	voiceChannelMember: [],
});

export const voiceSlice = createSlice({
	name: VOICE_FEATURE_KEY,
	initialState: initialVoiceState,
	reducers: {
		add: voiceAdapter.addOne,
		addMany: voiceAdapter.addMany,
		remove: voiceAdapter.removeOne,
		// ...
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchVoiceChannelMembers.pending, (state: VoiceState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchVoiceChannelMembers.fulfilled, (state: VoiceState, action: PayloadAction<any>) => {
				voiceAdapter.addMany(state, action.payload);
				//state.voiceChannelMember = action.payload;
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchVoiceChannelMembers.rejected, (state: VoiceState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const voiceReducer = voiceSlice.reducer;

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
export const voiceActions = {
	...voiceSlice.actions,
	fetchVoiceChannelMembers,
}

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
const { selectAll, selectEntities } = voiceAdapter.getSelectors();

export const getVoiceState = (rootState: { [VOICE_FEATURE_KEY]: VoiceState }): VoiceState => rootState[VOICE_FEATURE_KEY];

export const selectAllVoice = createSelector(getVoiceState, selectAll);

export const selectVoiceEntities = createSelector(getVoiceState, selectEntities);

export const selectVoiceChannelMembersByChannelId = (channelId: string) =>
	createSelector(selectVoiceEntities, (entities) => {
		const voiceMembers = Object.values(entities);
		return voiceMembers.filter((member) => member && member.voice_channel_id === channelId);
	});
