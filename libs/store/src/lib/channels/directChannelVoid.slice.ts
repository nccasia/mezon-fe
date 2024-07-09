import { IChannelCategorySetting, IDefaultNotificationCategory, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ensureSession, getMezonCtx, MezonValueContext } from '../helpers';
import { ApiDirectChannelVoice, ApiNotificationChannelCategoySetting, ApiNotificationSetting } from 'mezon-js/api.gen';
import memoize from 'memoizee';
import { IDirectChannelVoid } from '../../../../utils/src';

export interface DirectChannelVoidEntity extends IDirectChannelVoid {
	id: string; // Primary ID
}

export const mapDirectChannelVoidToEntity = (DirectChannelVoidRes: ApiDirectChannelVoice, directId: string) => {
	const id = directId+DirectChannelVoidRes.channel_id;
	return { ...DirectChannelVoidRes, directId, id };
};

export interface DirectChannelVoidState extends EntityState<DirectChannelVoidEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const DirectChannelVoidAdapter = createEntityAdapter<DirectChannelVoidEntity>();

type fetchChannelVoidsArgs = {
	userIds: string[];
	limit?: number;
	noCache?: boolean;
	directId: string;
};

const LIST_COMMON_CHANNEL_VOID_CACHED_TIME = 1000 * 60 * 3;
export const fetchChannelVoidsCached = memoize(
	(mezon: MezonValueContext, userIds: string[], limit: number) =>
		mezon.client.directChannelVoiceList(mezon.session, userIds, limit),
	{
		promise: true,
		maxAge: LIST_COMMON_CHANNEL_VOID_CACHED_TIME,
		normalizer: (args) => {
			return args[1].join('_');
		},
	},
);

export const fetchChannelVoids = createAsyncThunk('channels/fetchChannelVoids', async ({ userIds, noCache, directId }: fetchChannelVoidsArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));

	if (noCache) {
		fetchChannelVoidsCached.clear(mezon, userIds, 50);
	}
	
	const response = await fetchChannelVoidsCached(mezon, userIds, 50);
	if (!response.channelvoice) {
		return [];
	}
	return response.channelvoice.map((channelvoid: any) => mapDirectChannelVoidToEntity(channelvoid, directId));
});

export const initialDirectChannelVoidState: DirectChannelVoidState = DirectChannelVoidAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
});
export const directChannelVoidSlice = createSlice({
	name: "directchannelvoid",
	initialState: initialDirectChannelVoidState,
	reducers: {
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannelVoids.pending, (state: DirectChannelVoidState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchChannelVoids.fulfilled, (state: DirectChannelVoidState, action: PayloadAction<IChannelCategorySetting[]>) => {
				DirectChannelVoidAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchChannelVoids.rejected, (state: DirectChannelVoidState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});


export const directChannelVoidReducer = directChannelVoidSlice.reducer;

export const directChannelVoidActions = { ...directChannelVoidSlice.actions, fetchChannelVoids };

const { selectAll, selectEntities } = DirectChannelVoidAdapter.getSelectors();

export const getdirectChannelVoidState = (rootState: { ["directchannelvoid"]: DirectChannelVoidState }): DirectChannelVoidState => rootState["directchannelvoid"];

export const selectAllDirectChannelVoids = createSelector(getdirectChannelVoidState, selectAll);

export const selectDirectChannelVoidsEntities = createSelector(getdirectChannelVoidState, selectEntities);

export const selectDirectChannelVoidById = (id: string) => 
	createSelector(selectDirectChannelVoidsEntities, (clansEntities) => {
		return clansEntities[id] || null
		});
