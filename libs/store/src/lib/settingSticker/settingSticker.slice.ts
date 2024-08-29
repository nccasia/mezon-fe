import { LoadingStatus } from '@mezon/utils';
import { EntityState, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

import memoizee from 'memoizee';
import { ClanSticker } from 'mezon-js';
import { ApiClanStickerAddRequest, MezonUpdateClanStickerByIdBody } from 'mezon-js/api.gen';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';

export const SETTING_CLAN_STICKER = 'settingSticker';
const LIST_STICKER_CACHED_TIME = 1000 * 60 * 3;

export interface SettingClanStickerState extends EntityState<ClanSticker, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	hasGrandchildModal: boolean;
}
export interface FetchStickerArgs {
	clanId: string;
	noCache?: boolean;
}
export interface UpdateStickerArgs {
	request: MezonUpdateClanStickerByIdBody;
	stickerId: string;
	clan_id: string;
}
export const stickerAdapter = createEntityAdapter({
	selectId: (sticker: ClanSticker) => sticker.id || ''
});

export const initialSettingClanStickerState: SettingClanStickerState = stickerAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	hasGrandchildModal: false
});
const fetchStickerCached = memoizee((mezon: MezonValueContext, clanId: string) => mezon.socketRef.current?.listClanStickersByClanId(clanId), {
	promise: true,
	maxAge: LIST_STICKER_CACHED_TIME,
	normalizer: (args) => {
		return args[1] + args[0].session.username;
	}
});

export const fetchStickerByClanId = createAsyncThunk(
	'settingClanSticker/fetchClanSticker',
	async ({ clanId, noCache }: FetchStickerArgs, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			if (noCache) {
				fetchStickerCached.clear(mezon, clanId);
			}
			const response = await fetchStickerCached(mezon, clanId);
			if (response) {
				return response.stickers ?? [];
			}
			throw new Error('Emoji list is undefined or null');
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);
export const createSticker = createAsyncThunk(
	'settingClanSticker/createSticker',
	async (form: { request: ApiClanStickerAddRequest; clanId: string }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const res = await mezon.client.addClanSticker(mezon.session, form.request);
			if (res) {
				thunkAPI.dispatch(fetchStickerByClanId({ clanId: form.clanId, noCache: true }));
			} else {
				return thunkAPI.rejectWithValue({});
			}
		} catch (error) {
			return thunkAPI.rejectWithValue({ error });
		}
	}
);

export const updateSticker = createAsyncThunk(
	'settingClanSticker/updateSticker',
	async ({ request, stickerId, clan_id }: UpdateStickerArgs, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const res = await mezon.client.updateClanStickerById(mezon.session, stickerId, request);
			if (res) {
				thunkAPI.dispatch(fetchStickerByClanId({ clanId: clan_id, noCache: true }));
			}
		} catch (error) {
			return thunkAPI.rejectWithValue({ error });
		}
	}
);

export const deleteSticker = createAsyncThunk('settingClanSticker/deleteSticker', async (data: { stickerId: string; clan_id: string }, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const res = await mezon.client.deleteClanStickerById(mezon.session, data.stickerId, data.clan_id);
		if (res) {
			thunkAPI.dispatch(fetchStickerByClanId({ clanId: data.clan_id, noCache: true }));
		}
	} catch (error) {
		return thunkAPI.rejectWithValue({ error });
	}
});

export const settingClanStickerSlice = createSlice({
	name: SETTING_CLAN_STICKER,
	initialState: initialSettingClanStickerState,
	reducers: {
		openModalInChild: (state) => {
			state.hasGrandchildModal = true;
		},
		closeModalInChild: (state) => {
			state.hasGrandchildModal = false;
		}
	},
	extraReducers(builder) {
		builder
			.addCase(fetchStickerByClanId.fulfilled, (state: SettingClanStickerState, actions) => {
				state.loadingStatus = 'loaded';
				stickerAdapter.setAll(state, actions.payload);
			})
			.addCase(fetchStickerByClanId.pending, (state: SettingClanStickerState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchStickerByClanId.rejected, (state: SettingClanStickerState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const stickerSettingActions = {
	...settingClanStickerSlice.actions,
	fetchStickerByClanId
};

export const getStickerSettingState = (rootState: { [SETTING_CLAN_STICKER]: SettingClanStickerState }): SettingClanStickerState =>
	rootState[SETTING_CLAN_STICKER];
const { selectAll, selectEntities } = stickerAdapter.getSelectors();
export const selectAllStickerSuggestion = createSelector(getStickerSettingState, selectAll);
export const hasGrandchildModal = createSelector(getStickerSettingState, (state) => state.hasGrandchildModal);
export const selectStickerSuggestionEntities = createSelector(getStickerSettingState, selectEntities);
export const settingStickerReducer = settingClanStickerSlice.reducer;
export const settingClanStickerActions = { ...settingClanStickerSlice.actions, fetchStickerByClanId };
