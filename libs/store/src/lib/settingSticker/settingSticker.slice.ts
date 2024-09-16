import { LoadingStatus } from '@mezon/utils';
import { EntityState, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

import { ClanSticker } from 'mezon-js';
import { ApiClanStickerAddRequest, MezonUpdateClanStickerByIdBody } from 'mezon-js/api.gen';
import { ensureSession, ensureSocket, getMezonCtx } from '../helpers';

export const SETTING_CLAN_STICKER = 'settingSticker';

export interface SettingClanStickerState extends EntityState<ClanSticker, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	hasGrandchildModal: boolean;
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

export const fetchStickerByClanId = createAsyncThunk('settingClanSticker/fetchClanSticker', async (_, thunkAPI) => {
	try {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));
		const response = await mezon.socketRef.current?.listStickersByUserId();

		if (response) {
			return response.stickers ?? [];
		}
		throw new Error('Emoji list is undefined or null');
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});
export const createSticker = createAsyncThunk(
	'settingClanSticker/createSticker',
	async (form: { request: ApiClanStickerAddRequest; clanId: string }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const res = await mezon.client.addClanSticker(mezon.session, form.request);
			if (res) {
				thunkAPI.dispatch(fetchStickerByClanId());
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
				thunkAPI.dispatch(fetchStickerByClanId());
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
			thunkAPI.dispatch(fetchStickerByClanId());
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
	fetchStickerByClanId
};

export const getStickerSettingState = (rootState: { [SETTING_CLAN_STICKER]: SettingClanStickerState }): SettingClanStickerState =>
	rootState[SETTING_CLAN_STICKER];
const { selectAll, selectEntities } = stickerAdapter.getSelectors();
export const selectAllStickerSuggestion = createSelector(getStickerSettingState, selectAll);
export const selectStickerSuggestionEntities = createSelector(getStickerSettingState, selectEntities);
export const hasGrandchildModal = createSelector(getStickerSettingState, (state) => state.hasGrandchildModal);
export const selectStickerByClanId = (clanId: string) =>
	createSelector(selectAllStickerSuggestion, (stickers) => {
		return stickers.filter((sticker) => sticker.clan_id === clanId);
	});
export const settingStickerReducer = settingClanStickerSlice.reducer;
export const settingClanStickerActions = { ...settingClanStickerSlice.actions, fetchStickerByClanId };
