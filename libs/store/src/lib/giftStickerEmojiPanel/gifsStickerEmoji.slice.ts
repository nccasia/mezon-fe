import { SubPanelName } from '@mezon/utils';
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

export const GIFS_STICKERS_EMOJIS_FEATURE_KEY = 'gifsStickersEmojis';

export interface GifsStickersEmojisState {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	subPanelActive: SubPanelName;
	valueInputToCheckHandleSearchState?: string;
	placeHolder: string;
}

export const initialGifsStickersEmojisState: GifsStickersEmojisState = {
	loadingStatus: 'not loaded',
	error: null,
	subPanelActive: SubPanelName.NONE,
	valueInputToCheckHandleSearchState: '',
	placeHolder: 'Find the perfect emoji',
};

export const gifsStickersEmojisSlice = createSlice({
	name: GIFS_STICKERS_EMOJIS_FEATURE_KEY,
	initialState: initialGifsStickersEmojisState,
	reducers: {
		setSubPanelActive: (state, action: PayloadAction<SubPanelName>) => {
			state.subPanelActive = action.payload;
		},
		setValueInputSearch: (state, action) => {
			state.valueInputToCheckHandleSearchState = action.payload;
		},
		setPlaceHolderInput: (state, action) => {
			state.placeHolder = action.payload;
		},
	},
});

export const gifsStickerEmojiReducer = gifsStickersEmojisSlice.reducer;

export const gifsStickerEmojiActions = { ...gifsStickersEmojisSlice.actions };

export const getgifsStickerEmojiState = (rootState: { [GIFS_STICKERS_EMOJIS_FEATURE_KEY]: GifsStickersEmojisState }): GifsStickersEmojisState =>
	rootState[GIFS_STICKERS_EMOJIS_FEATURE_KEY];

export const selectSubPanelActive = createSelector(getgifsStickerEmojiState, (state) => state.subPanelActive);

export const selectValueInputSearch = createSelector(
	getgifsStickerEmojiState,
	(state: GifsStickersEmojisState) => state.valueInputToCheckHandleSearchState,
);

export const selectPlaceHolder = createSelector(getgifsStickerEmojiState, (state: GifsStickersEmojisState) => state.placeHolder);
