import { IChannelCategorySetting, IHashtagDmVoice, LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import memoize from 'memoizee';
import { ensureSession, getMezonCtx, MezonValueContext } from '../helpers';
import { HashtagDm } from 'mezon-js';

export interface HashtagDmVoiceEntity extends IHashtagDmVoice {
	id: string; // Primary ID
}

export const mapHashtagDmVoiceToEntity = (HashtagDmVoiceRes: HashtagDm, directId: string) => {
	const id = directId+HashtagDmVoiceRes.channel_id;
	return { ...HashtagDmVoiceRes, directId, id };
};

export interface HashtagDmVoiceState extends EntityState<HashtagDmVoiceEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const HashtagDmVoiceAdapter = createEntityAdapter<HashtagDmVoiceEntity>();

type fetchHashtagDmVoiceArgs = {
	userIds: string[];
	limit?: number;
	noCache?: boolean;
	directId: string;
};

const LIST_COMMON_CHANNEL_VOID_CACHED_TIME = 1000 * 60 * 3;
export const fetchHashtagDmVoiceCached = memoize(
	(mezon: MezonValueContext, userIds: string[], limit: number) =>
		mezon.socketRef.current?.hashtagDMList(userIds, limit),
	{
		promise: true,
		maxAge: LIST_COMMON_CHANNEL_VOID_CACHED_TIME,
		normalizer: (args) => {
			return args[1].join('_');
		},
	},
);

export const fetchHashtagDmVoice = createAsyncThunk('channels/fetchHashtagDmVoice', async ({ userIds, noCache, directId }: fetchHashtagDmVoiceArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));

	if (noCache) {
		fetchHashtagDmVoiceCached.clear(mezon, userIds, 50);
	}
	
	const response = await fetchHashtagDmVoiceCached(mezon, userIds, 50);
	if (!response?.hashtag_dm) {
		return [];
	}
	return response.hashtag_dm.map((channelvoid: any) => mapHashtagDmVoiceToEntity(channelvoid, directId));
});

export const initialHashtagDmVoiceState: HashtagDmVoiceState = HashtagDmVoiceAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
});
export const hashtagDmVoiceSlice = createSlice({
	name: "hashtagdmvoice",
	initialState: initialHashtagDmVoiceState,
	reducers: {
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchHashtagDmVoice.pending, (state: HashtagDmVoiceState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchHashtagDmVoice.fulfilled, (state: HashtagDmVoiceState, action: PayloadAction<IChannelCategorySetting[]>) => {
				HashtagDmVoiceAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchHashtagDmVoice.rejected, (state: HashtagDmVoiceState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});


export const hashtagDmVoiceReducer = hashtagDmVoiceSlice.reducer;

export const hashtagDmVoiceActions = { ...hashtagDmVoiceSlice.actions, fetchHashtagDmVoice };

const { selectAll, selectEntities } = HashtagDmVoiceAdapter.getSelectors();

export const gethashtagDmVoiceState = (rootState: { ["hashtagdmvoice"]: HashtagDmVoiceState }): HashtagDmVoiceState => rootState["hashtagdmvoice"];

export const selectAllHashtagDmVoice = createSelector(gethashtagDmVoiceState, selectAll);

export const selectHashtagDmVoiceEntities = createSelector(gethashtagDmVoiceState, selectEntities);

export const selectHashtagDmVoiceById = (id: string) => 
	createSelector(selectHashtagDmVoiceEntities, (clansEntities) => {
		return clansEntities[id] || null
	});
