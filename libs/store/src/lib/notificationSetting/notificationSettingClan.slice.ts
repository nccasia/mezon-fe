import { IDefaultNotification, IDefaultNotificationClan, LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import memoize from 'memoizee';
import { ApiNotificationSetting } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx, MezonValueContext } from '../helpers';
export const DEFAULT_NOTIFICATION_CLAN_FEATURE_KEY = 'defaultnotificationclan';

export interface DefaultNotificationClanState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	defaultNotificationClan?: IDefaultNotificationClan | null;
}

export const initialDefaultNotificationClanState: DefaultNotificationClanState = {
	loadingStatus: 'not loaded',
	defaultNotificationClan: null,
};

const LIST_NOTIFI_CLAN_CACHED_TIME = 1000 * 60 * 3;
export const fetchNotificationClanSetting = memoize(
	(mezon: MezonValueContext, clanId: string) =>
		// mezon.client.getNotificationClanSetting(mezon.session, clanId),
		mezon.socketRef.current?.getNotificationClanSetting(clanId),
	{
		promise: true,
		maxAge: LIST_NOTIFI_CLAN_CACHED_TIME,
		normalizer: (args) => {
			return args[1];
		},
	},
);

type fetchNotificationClanSettingsArgs = {
	clanId: string;
	noCache?: boolean;
};

export const getDefaultNotificationClan = createAsyncThunk('defaultnotificationclan/getDefaultNotificationClan', 
	async ({clanId, noCache}:fetchNotificationClanSettingsArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	if (noCache) {
		fetchNotificationClanSetting.clear(mezon, clanId);
	}
	const response = await fetchNotificationClanSetting(mezon, clanId);
	console.log("response setting", response);
	
	if (!response) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return response;
});

type SetDefaultNotificationPayload = {
    clan_id?: string;
    notification_type?: number;
};

export const setDefaultNotificationClan = createAsyncThunk(
	'defaultnotificationclan/setDefaultNotificationClan',
	async ({ clan_id, notification_type}: SetDefaultNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			clan_id: clan_id,
			notification_type: notification_type,
		}
		const response = await mezon.client.setNotificationClan(mezon.session, body);
		if (!response) {
			
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(getDefaultNotificationClan({clanId: clan_id || "", noCache: true}));
		return response;
	},
);


export const defaultNotificationClanSlice = createSlice({
	name: DEFAULT_NOTIFICATION_CLAN_FEATURE_KEY,
	initialState: initialDefaultNotificationClanState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getDefaultNotificationClan.pending, (state: DefaultNotificationClanState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(getDefaultNotificationClan.fulfilled, (state: DefaultNotificationClanState, action: PayloadAction<ApiNotificationSetting>) => {
				state.defaultNotificationClan = action.payload;
				state.loadingStatus = 'loaded';
			})
			.addCase(getDefaultNotificationClan.rejected, (state: DefaultNotificationClanState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

export interface DefaultNotificationListEntity extends IDefaultNotification {
	id: string; // Primary ID
}

export const defaultNotificationClanReducer = defaultNotificationClanSlice.reducer;

export const defaultNotificationActions = { ...defaultNotificationClanSlice.actions, getDefaultNotificationClan, setDefaultNotificationClan };

export const getDefaultNotificationClanState = (rootState: { [DEFAULT_NOTIFICATION_CLAN_FEATURE_KEY]: DefaultNotificationClanState }): DefaultNotificationClanState => rootState[DEFAULT_NOTIFICATION_CLAN_FEATURE_KEY];

export const selectDefaultNotificationClan = createSelector(getDefaultNotificationClanState, (state: DefaultNotificationClanState) => state.defaultNotificationClan);
