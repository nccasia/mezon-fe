import { LoadingStatus } from '@mezon/utils';
import { EntityState, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { HashtagDm } from 'mezon-js';
import { ensureSocket, getMezonCtx } from '../helpers';

export interface HashtagDmState extends EntityState<HashtagDm, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const HashtagDmAdapter = createEntityAdapter({
	selectId: (channel: HashtagDm) => channel.channel_id || ''
});

type fetchHashtagDmArgs = {
	userIds: string[];
	limit?: number;
	directId: string;
};

export const fetchHashtagDm = createAsyncThunk('channels/fetchHashtagDm', async ({ userIds, directId }: fetchHashtagDmArgs, thunkAPI) => {
	const mezon = await ensureSocket(getMezonCtx(thunkAPI));
	const response = await mezon.socketRef.current?.hashtagDMList(userIds, 500);
	if (!response?.hashtag_dm) {
		return [];
	}
	return response.hashtag_dm.map((dm: HashtagDm) => ({
		...dm,
		id: dm.channel_id
	}));
});

export const initialHashtagDmState: HashtagDmState = HashtagDmAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null
});
export const hashtagDmSlice = createSlice({
	name: 'hashtagdm',
	initialState: initialHashtagDmState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchHashtagDm.pending, (state: HashtagDmState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchHashtagDm.fulfilled, (state: HashtagDmState, action) => {
				HashtagDmAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchHashtagDm.rejected, (state: HashtagDmState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const hashtagDmReducer = hashtagDmSlice.reducer;

export const hashtagDmActions = { ...hashtagDmSlice.actions, fetchHashtagDm };

const { selectAll, selectEntities, selectById } = HashtagDmAdapter.getSelectors();

export const gethashtagDmState = (rootState: { ['hashtagdm']: HashtagDmState }): HashtagDmState => rootState['hashtagdm'];

export const selectAllHashtagDm = createSelector(gethashtagDmState, selectAll);

export const selectHashtagDmEntities = createSelector(gethashtagDmState, selectEntities);

export const selectHashtagDmById = (id: string) =>
	createSelector(gethashtagDmState, (state) => {
		const hashtag = selectById(state, id);
		return { ...hashtag, id: hashtag?.channel_id || '' };
	});
