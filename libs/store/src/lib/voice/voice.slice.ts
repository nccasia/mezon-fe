import { IVoice, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

export const VOICE_FEATURE_KEY = 'voice';

/*
 * Update these interfaces according to your requirements.
 */
export interface VoiceEntity extends IVoice {
	id: string; // Primary ID
}

export type DataVoiceSocketOptinals = {
	clanId?: string;
	clanName?: string;
	id?: string;
	participant?: string;
	userId?: string;
	roomName?: string;
	lastScreenshot?: string;
};

export interface VoiceState extends EntityState<VoiceEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	dataVoiceSocket?: DataVoiceSocketOptinals;
	// dataVoiceSocketList?: DataVoiceSocketOptinals[];
}

export const voiceAdapter = createEntityAdapter<VoiceEntity>();

export const pushMemberToVoiceChannelData = createAsyncThunk(
	'voice/pushMemberToVoiceChannelData',
	async ({ clanId, clanName, id, participant, userId, roomName, lastScreenshot }: DataVoiceSocketOptinals, thunkAPI) => {
		try {
			await thunkAPI.dispatch(voiceActions.setDataSocketToStore({ clanId, clanName, id, participant, userId, roomName, lastScreenshot }));
			console.log('getData-OKE2', { clanId, clanName, id, participant, userId, roomName, lastScreenshot });
		} catch (e) {
			console.log(e);
			return thunkAPI.rejectWithValue([]);
		}
	},
);

/**
 * Export an effect using createAsyncThunk from
 * the Redux Toolkit: https://redux-toolkit.js.org/api/createAsyncThunk
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
 *   dispatch(fetchUsers())
 * }, [dispatch]);
 * ```
 */
export const fetchVoice = createAsyncThunk<VoiceEntity[]>('voice/fetchStatus', async (_, thunkAPI) => {
	/**
	 * Replace this with your custom fetch call.
	 * For example, `return myApi.getUserss()`;
	 * Right now we just return an empty array.
	 */
	return Promise.resolve([]);
});

export const initialVoiceState: VoiceState = voiceAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	dataVoiceSocket: {
		clanId: 'a',
		clanName: 'b',
		id: 'c',
		participant: 'd',
		userId: 'e',
		roomName: 'f',
		lastScreenshot: 'g',
	},
	// dataVoiceSocketList: [],
});

export const voiceSlice = createSlice({
	name: VOICE_FEATURE_KEY,
	initialState: initialVoiceState,
	reducers: {
		// ...
		add: voiceAdapter.addOne,
		remove: voiceAdapter.removeOne,
		setDataSocketToStore: (state, action: PayloadAction<DataVoiceSocketOptinals>) => {
			console.log('act', action);
			// state.dataVoiceSocket = {
			// 	clanId: action.payload?.clanId || state?.dataVoiceSocket?.clanId,
			// 	clanName: action.payload?.clanName || state?.dataVoiceSocket?.clanName,
			// 	id: action.payload?.id || state?.dataVoiceSocket?.id,
			// 	participant: action.payload?.participant || state?.dataVoiceSocket?.participant,
			// 	userId: action.payload?.userId || state?.dataVoiceSocket?.userId,
			// 	roomName: action.payload?.roomName || state?.dataVoiceSocket?.roomName,
			// 	lastScreenshot: action.payload?.lastScreenshot || state?.dataVoiceSocket?.lastScreenshot,
			// };
			console.log(state.dataVoiceSocket);
		},
	},

	extraReducers: (builder) => {
		builder
			.addCase(fetchVoice.pending, (state: VoiceState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchVoice.fulfilled, (state: VoiceState, action: PayloadAction<VoiceEntity[]>) => {
				voiceAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchVoice.rejected, (state: VoiceState, action) => {
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

export const { setDataSocketToStore } = voiceSlice.actions;

export const voiceActions = { ...voiceSlice.actions, fetchVoice, pushMemberToVoiceChannelData };

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

export const selectNewestUserJoinedVoice = createSelector(getVoiceState, (state) => state.dataVoiceSocket);
