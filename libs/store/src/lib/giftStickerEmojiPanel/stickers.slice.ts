import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

export const STICKERS_FEATURE_KEY = 'stickers';

export interface StickersEntity {
	id: string;
}

export const stickersAdapter = createEntityAdapter<StickersEntity>();

export interface StickersState extends EntityState<StickersEntity, string> {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	stickersData?: any;
}
export const initialStickersState: StickersState = stickersAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	stickersData: null
});

export const fetchStickersData = createAsyncThunk<any>('stickers/fetchStatus', async (_, thunkAPI) => {
	try {
		const response = await fetch(`${process.env.NX_CHAT_APP_API_GIPHY_TRENDING}`);

		if (!response.ok) {
			throw new Error('Failed to fetch stickers data');
		}
		const data = await response.json();
		return data;
	} catch (error) {
		return thunkAPI.rejectWithValue(error);
	}
});

export const stickersSlice = createSlice({
	name: STICKERS_FEATURE_KEY,
	initialState: initialStickersState,
	reducers: {
		add: stickersAdapter.addOne,
		remove: stickersAdapter.removeOne
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchStickersData.pending, (state: StickersState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchStickersData.fulfilled, (state: StickersState, action: PayloadAction<StickersEntity[]>) => {
				stickersAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchStickersData.rejected, (state: StickersState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const stickersReducer = stickersSlice.reducer;

export const stickersActions = {
	...stickersSlice.actions,
	fetchStickersData
};

const { selectAll, selectEntities } = stickersAdapter.getSelectors();

export const getStickersState = (rootState: { [STICKERS_FEATURE_KEY]: StickersState }): StickersState => rootState[STICKERS_FEATURE_KEY];

export const selectAllStickers = createSelector(getStickersState, selectAll);

export const selectStickersEntities = createSelector(getStickersState, selectEntities);
