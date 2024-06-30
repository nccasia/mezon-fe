import { IEmoji, IEmojiImage } from '@mezon/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ensureSession, getMezonCtx } from '../helpers';

export const EMOJI_SUGGESTION_FEATURE_KEY = 'suggestionEmoji';

export interface EmojiSuggestionEntity extends IEmoji {
	id: string;
}

export interface FetchEmojiMobilePayload {
	emoji: IEmoji[];
	emojiImage: IEmojiImage[];
}

export interface EmojiSuggestionState extends EntityState<EmojiSuggestionEntity, string> {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	emojiPicked: string;
	emojiSuggestionListStatus: boolean;
	keyCodeFromKeyBoardState: number;
	textToSearchEmojiSuggestion: string;
	addEmojiAction: boolean;
	emojiImage?: IEmojiImage[];
	shiftPressed: boolean;
}

export const emojiSuggestionAdapter = createEntityAdapter({
	selectId: (emo: EmojiSuggestionEntity) => emo.id || emo.name || '',
});
let emojiCache: IEmoji[] = [];
let emojiImageCache: IEmojiImage[] = [];

export const fetchEmoji = createAsyncThunk<any>('emoji/fetchEmoji', async (_, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.listClanEmoji(mezon.session);
		console.log(response)
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const fetchEmojiMobile = createAsyncThunk<any>('emoji/fetchStatusMobile', async (_, thunkAPI) => {
	try {
		const cachedEmojiImageData = await AsyncStorage.getItem('emojiImageCache');

		if (cachedEmojiImageData) {
			emojiImageCache = JSON.parse(cachedEmojiImageData) as IEmojiImage[];
			return {
				emojiImage: emojiImageCache,
			};
		}
		// Temp: mock api to get emoji image data
		const responseEmojiImg = await fetch(`https://api.mockfly.dev/mocks/a82e14d2-488d-41d3-8ca3-8af8e92626b9/emoijmobile`);
		if (!responseEmojiImg.ok) {
			throw new Error('Failed to fetch emoji data');
		}
		emojiImageCache = await responseEmojiImg.json();
		await AsyncStorage.setItem('emojiImageCache', JSON.stringify(emojiImageCache));
		return {
			emojiImage: emojiImageCache,
		};
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
	addEmojiAction: false,
	shiftPressed: false,
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
		setAddEmojiActionChatbox: (state, action: PayloadAction<boolean>) => {
			state.addEmojiAction = action.payload;
		},
		setShiftPressed: (state, action: PayloadAction<boolean>) => {
			state.shiftPressed = action.payload;
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

		builder
			.addCase(fetchEmojiMobile.pending, (state: EmojiSuggestionState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchEmojiMobile.fulfilled, (state: EmojiSuggestionState, action: PayloadAction<FetchEmojiMobilePayload>) => {
				state.loadingStatus = 'loaded';
				state.emojiImage = action.payload.emojiImage;
			})
			.addCase(fetchEmojiMobile.rejected, (state: EmojiSuggestionState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

export const emojiSuggestionReducer = emojiSuggestionSlice.reducer;

export const emojiSuggestionActions = {
	...emojiSuggestionSlice.actions,
	fetchEmoji,
	fetchEmojiMobile,
};

const { selectAll, selectEntities } = emojiSuggestionAdapter.getSelectors();

export const getEmojiSuggestionState = (rootState: { [EMOJI_SUGGESTION_FEATURE_KEY]: EmojiSuggestionState }): EmojiSuggestionState =>
	rootState[EMOJI_SUGGESTION_FEATURE_KEY];

export const selectAllEmojiSuggestion = createSelector(getEmojiSuggestionState, selectAll);

export const selectEmojiSuggestionEntities = createSelector(getEmojiSuggestionState, selectEntities);

export const selectEmojiSuggestion = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.emojiPicked);

export const selectEmojiListStatus = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.emojiSuggestionListStatus);

export const selectEmojiImage = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.emojiImage);

export const selectTextToSearchEmojiSuggestion = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.textToSearchEmojiSuggestion);

export const selectAddEmojiState = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.addEmojiAction);

export const selectShiftPressedStatus = createSelector(getEmojiSuggestionState, (emojisState) => emojisState.shiftPressed);
