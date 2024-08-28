import { IHashtagDm, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { HashtagDm } from 'mezon-js';
import { ensureSocket, getMezonCtx } from '../helpers';

export interface HashtagDmEntity extends IHashtagDm {
	id: string; // Primary ID
	directId: string;
}

export const mapHashtagDmToEntity = (HashtagDmRes: HashtagDm, directId: string) => {
	const id = directId + HashtagDmRes.channel_id;
	return { ...HashtagDmRes, directId, id };
};

export interface HashtagDmState extends EntityState<HashtagDmEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const HashtagDmAdapter = createEntityAdapter<HashtagDmEntity>();

type fetchHashtagDmArgs = {
	userIds: string[];
	limit?: number;
	directId: string;
};

export const fetchHashtagDm = createAsyncThunk('channels/fetchHashtagDm', async ({ userIds, directId }: fetchHashtagDmArgs, thunkAPI) => {
	const mezon = await ensureSocket(getMezonCtx(thunkAPI));
	const response = await mezon.socketRef.current?.hashtagDMList(userIds, 50);
	if (!response?.hashtag_dm) {
		return [];
	}
	return response.hashtag_dm.map((channel: any) => mapHashtagDmToEntity(channel, directId));
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
			.addCase(fetchHashtagDm.fulfilled, (state: HashtagDmState, action: PayloadAction<HashtagDmEntity[]>) => {
				HashtagDmAdapter.setMany(state, action.payload);
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

const { selectAll, selectEntities } = HashtagDmAdapter.getSelectors();

export const gethashtagDmState = (rootState: { ['hashtagdm']: HashtagDmState }): HashtagDmState => rootState['hashtagdm'];

export const selectAllHashtagDm = createSelector(gethashtagDmState, selectAll);

export const selectHashtagDmEntities = createSelector(gethashtagDmState, selectEntities);

export const selectHashtagDMByDirectId = (id: string) =>
	createSelector(selectAllHashtagDm, (channelEntities) => {
		return channelEntities.filter((channel) => channel.directId === id);
	});
export const selectHashtagDmById = (id: string) =>
	createSelector(selectHashtagDmEntities, (clansEntities) => {
		return clansEntities[id] || null;
	});
