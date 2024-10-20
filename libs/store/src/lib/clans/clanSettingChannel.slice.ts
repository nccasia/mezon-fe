import { LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState } from '@reduxjs/toolkit';

import { ApiChannelSettingItem } from 'mezon-js/dist/api.gen';
import { ensureSession, getMezonCtx, MezonValueContext } from '../helpers';
import { memoizeAndTrack } from '../memoize';

export const SETTING_CLAN_CHANNEL = 'settingClanChannel';

const CHANNEL_SETTING_CLAN_CACHE_TIME = 1000 * 60 * 3;

export interface SettingClanChannelState extends EntityState<ApiChannelSettingItem, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	channelCount: number;
	threadCount: number;
}

export const channelSettingAdapter = createEntityAdapter({
	selectId: (channel: ApiChannelSettingItem) => channel.id || ''
});

export const initialSettingClanChannelState: SettingClanChannelState = channelSettingAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	channelCount: 0,
	threadCount: 0
});

export const fetchChannelByUserIdCached = memoizeAndTrack(
	async (mezon: MezonValueContext, clanId: string) => {
		const response = await mezon.client.getChannelSettingInClan(
			mezon.session,
			clanId,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			100
		);
		return response;
	},
	{
		promise: true,
		maxAge: CHANNEL_SETTING_CLAN_CACHE_TIME,
		normalizer: (args) => {
			return args[0]?.session?.username || '' + args[1];
		}
	}
);

export const fetchChannelByUserId = createAsyncThunk(
	'channelSetting/fetchClanChannelSetting',
	async ({ noCache = false, clanId }: { noCache?: boolean; clanId: string }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			if (noCache) {
				fetchChannelByUserIdCached.clear(mezon, clanId);
			}

			const response = await fetchChannelByUserIdCached(mezon, clanId);
			if (response) {
				return response;
			}
			throw new Error('Emoji list is undefined or null');
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);

export const settingClanChannelSlice = createSlice({
	name: SETTING_CLAN_CHANNEL,
	initialState: initialSettingClanChannelState,
	reducers: {},
	extraReducers(builder) {
		builder
			.addCase(fetchChannelByUserId.fulfilled, (state: SettingClanChannelState, actions) => {
				state.loadingStatus = 'loaded';
				channelSettingAdapter.setAll(state, actions.payload.channel_setting_list || []);
				state.channelCount = actions.payload?.channel_count || 0;
				state.threadCount = actions.payload?.thread_count || 0;
			})
			.addCase(fetchChannelByUserId.pending, (state: SettingClanChannelState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchChannelByUserId.rejected, (state: SettingClanChannelState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const channelSettingActions = {
	...settingClanChannelSlice.actions,
	fetchChannelByUserId
};

export const getChannelSettingState = (rootState: { [SETTING_CLAN_CHANNEL]: SettingClanChannelState }): SettingClanChannelState =>
	rootState[SETTING_CLAN_CHANNEL];
const { selectAll, selectEntities, selectById } = channelSettingAdapter.getSelectors();
export const selectAllChannelSuggestion = createSelector(getChannelSettingState, selectAll);
export const selectChannelSuggestionEntities = createSelector(getChannelSettingState, selectEntities);
export const selectOneChannelInfor = (channelId: string) => createSelector(getChannelSettingState, (state) => selectById(state, channelId));
export const settingChannelReducer = settingClanChannelSlice.reducer;
export const selectNumberChannelCount = createSelector(getChannelSettingState, (state) => state.channelCount);
export const selectNumberThreadCount = createSelector(getChannelSettingState, (state) => state.threadCount);
