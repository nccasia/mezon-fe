import { IEmoji } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

export const EMOJI_SUGGESTION_FEATURE_KEY = 'suggestionEmoji';

export interface EmojiSuggestionEntity extends IEmoji {
	id: string;
}

export interface EmojiSuggestionState extends EntityState<EmojiSuggestionEntity, string> {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	emojiPicked: string;
	emojiSuggestionListStatus: boolean;
	keyCodeFromKeyBoardState: number;
	textToSearchEmojiSuggestion: string;
	pressAnyButtonState: boolean;
}

export const emojiSuggestionAdapter = createEntityAdapter({
	selectId: (emo: EmojiSuggestionEntity) => emo.id || emo.name || '',
});
let emojiCache: IEmoji[] = [];

export const fetchEmoji = createAsyncThunk<any>('emoji/fetchStatus', async (_, thunkAPI) => {
	try {
		const cachedData = localStorage.getItem('emojiCache');
		if (cachedData) {
			const cachedEmojis = JSON.parse(cachedData) as IEmoji[];
			return cachedEmojis;
		}
		const response = await fetch(`${process.env.NX_CHAT_APP_CDN_META_DATA_EMOJI}`);
		if (!response.ok) {
			throw new Error('Failed to fetch emoji data');
		}
		const data = await response.json();
		emojiCache = data.emojis;
		localStorage.setItem('emojiCache', JSON.stringify(emojiCache));
		return emojiCache;
	} catch (error) {
		return thunkAPI.rejectWithValue(error);
	}
});

export const initialEmojiSuggestionState: EmojiSuggestionState = emojiSuggestionAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	emojiPicked: '',
	emojiSuggestionListStatus: false,
	keyCodeFromKeyBoardState: 1000,
	textToSearchEmojiSuggestion: '',
	pressAnyButtonState: false,
});

export const emojiSuggestionSlice = createSlice({
	name: EMOJI_SUGGESTION_FEATURE_KEY,
	initialState: initialEmojiSuggestionState,
	reducers: {
		add: emojiSuggestionAdapter.addOne,
		remove: emojiSuggestionAdapter.removeOne,

		setSuggestionEmojiPicked: (state, action: PayloadAction<string>) => {
			state.emojiPicked = action.payload;
		},

		setStatusSuggestionEmojiList: (state, action: PayloadAction<boolean>) => {
			state.emojiSuggestionListStatus = action.payload;
		},
		setTextToSearchEmojiSuggestion: (state, action: PayloadAction<string>) => {
			state.textToSearchEmojiSuggestion = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEmoji.pending, (state: EmojiSuggestionState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchEmoji.fulfilled, (state: EmojiSuggestionState, action: PayloadAction<EmojiSuggestionEntity[]>) => {
				emojiSuggestionAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchEmoji.rejected, (state: EmojiSuggestionState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

export const emojiSuggestionReducer = emojiSuggestionSlice.reducer;

export const emojiSuggestionActions = {
	...emojiSuggestionSlice.actions,
	fetchEmoji,
};

const { selectAll, selectEntities } = emojiSuggestionAdapter.getSelectors();

export const getEmojiSuggestionState = (rootState: { [EMOJI_SUGGESTION_FEATURE_KEY]: EmojiSuggestionState }): EmojiSuggestionState =>
	rootState[EMOJI_SUGGESTION_FEATURE_KEY];

export const selectAllEmojiSuggestion = createSelector(getEmojiSuggestionState, selectAll);

export const selectEmojiSuggestionEntities = createSelector(getEmojiSuggestionState, selectEntities);

export const selectEmojiSuggestion = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.emojiPicked);

export const selectEmojiListStatus = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.emojiSuggestionListStatus);

export const selectTextToSearchEmojiSuggestion = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.textToSearchEmojiSuggestion);
