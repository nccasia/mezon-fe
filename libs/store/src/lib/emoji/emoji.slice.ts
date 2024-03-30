import { IEmoji, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import emojisMetaData from 'apps/chat/src/assets/dataEmoji/metaDataEmojis.json';

export const EMOJIS_FEATURE_KEY = 'emojis';
export interface EmojisEntity extends IEmoji {}
export const emojisAdapter = createEntityAdapter<EmojisEntity>();

export interface EmojisState extends EntityState<EmojisEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	emojisData?: {
		[key: string]: IEmoji | any;
	};
	emojiPicked: string;
}

export const fetchEmojis = createAsyncThunk<EmojisEntity[]>('emojis/fetchEmojiData', async (_, thunkAPI) => {
	return Promise.resolve([]);
});

export const initialEmojisState: EmojisState = emojisAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	emojisData: emojisMetaData.emojis,
	emojiPicked: '',
});

export const emojisSlice = createSlice({
	name: EMOJIS_FEATURE_KEY,
	initialState: initialEmojisState,
	reducers: {
		add: emojisAdapter.addOne,
		remove: emojisAdapter.removeOne,
		setEmojiPicked: (state, action: PayloadAction<string>) => {
			state.emojiPicked = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEmojis.pending, (state: EmojisState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchEmojis.fulfilled, (state: EmojisState, action: PayloadAction<EmojisEntity[]>) => {
				emojisAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchEmojis.rejected, (state: EmojisState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

export const emojisReducer = emojisSlice.reducer;
export const emojisAction = emojisSlice.actions;
const { selectAll, selectEntities } = emojisAdapter.getSelectors();
export const getEmojisState = (rootState: { [EMOJIS_FEATURE_KEY]: EmojisState }): EmojisState => rootState[EMOJIS_FEATURE_KEY];
export const selectAllEmojis = createSelector(getEmojisState, selectAll);
export const selectEmojisEntities = createSelector(getEmojisState, selectEntities);
export const selectEmojisData = createSelector(getEmojisState, (emojisState) => emojisState.emojisData);
export const selectEmojiSuggestion = createSelector(getEmojisState, (emojisState) => emojisState.emojiPicked);
