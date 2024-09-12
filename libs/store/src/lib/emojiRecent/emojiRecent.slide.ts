import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import memoizee from 'memoizee';
import { UserEmojiUsage } from 'mezon-js';
import { ensureSocket, getMezonCtx, MezonValueContext } from '../helpers';

const LIST_EMOJI_RECENT_CACHED_TIME = 1000 * 60 * 3;
export const RECENT_EMOJI_SUGGESTION_FEATURE_KEY = 'recentEmojiSuggestion';

export interface UserRecentEmojiUsage extends UserEmojiUsage {
	id: string;
}

export interface RecentEmojiSuggestionState extends EntityState<UserRecentEmojiUsage, string> {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	emojiSuggestionListStatus: boolean;
	addEmojiAction: boolean;
	shiftPressed: boolean;
}

export const recentEmojiSuggestionAdapter = createEntityAdapter({
	selectId: (emo: UserRecentEmojiUsage) => emo.id || ''
});

type FetchEmojiArgs = {
	clanId: string;
	noCache?: boolean;
};

const fetchRecentEmojiCached = memoizee((mezon: MezonValueContext, clanId: string) => mezon.socketRef.current?.getUserEmojiUsage(clanId), {
	promise: true,
	maxAge: LIST_EMOJI_RECENT_CACHED_TIME,
	normalizer: (args) => args[1] + args[0].session.username
});

export const recentfetchEmoji = createAsyncThunk('recentEmoji/fetchRecentEmoji', async ({ clanId, noCache }: FetchEmojiArgs, thunkAPI) => {
	const mezon = await ensureSocket(getMezonCtx(thunkAPI));
	if (noCache) {
		fetchRecentEmojiCached.clear(mezon, clanId);
	}
	const response = await fetchRecentEmojiCached(mezon, clanId);
	if (!response?.user_emoji_usage) {
		throw new Error('Emoji list is undefined or null');
	}
	return response.user_emoji_usage;
});

export const initialRecentEmojiSuggestionState: RecentEmojiSuggestionState = recentEmojiSuggestionAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	emojiSuggestionListStatus: false,
	textToSearchEmojiSuggestion: '',
	addEmojiAction: false,
	shiftPressed: false
});

export const recentEmojiSuggestionSlice = createSlice({
	name: RECENT_EMOJI_SUGGESTION_FEATURE_KEY,
	initialState: initialRecentEmojiSuggestionState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(recentfetchEmoji.pending, (state) => {
				state.loadingStatus = 'loading';
			})
			.addCase(recentfetchEmoji.fulfilled, (state, action: PayloadAction<any[]>) => {
				recentEmojiSuggestionAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(recentfetchEmoji.rejected, (state, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const recentEmojiSuggestionReducer = recentEmojiSuggestionSlice.reducer;

export const recentEmojiSuggestionActions = {
	...recentEmojiSuggestionSlice.actions,
	recentfetchEmoji
};

const { selectAll, selectEntities } = recentEmojiSuggestionAdapter.getSelectors();

export const getRecentEmojiSuggestionState = (rootState: {
	[RECENT_EMOJI_SUGGESTION_FEATURE_KEY]: RecentEmojiSuggestionState;
}): RecentEmojiSuggestionState => rootState[RECENT_EMOJI_SUGGESTION_FEATURE_KEY];

export const selectAllRecentEmojiSuggestion = createSelector(getRecentEmojiSuggestionState, selectAll);
export const selectRecentEmojiSuggestionEntities = createSelector(getRecentEmojiSuggestionState, selectEntities);
