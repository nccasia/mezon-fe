import { INotificationSetting, LoadingStatus } from '@mezon/utils';
import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiNotificationUserChannel } from 'mezon-js/api.gen';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';
import { defaultNotificationCategoryActions } from './notificationSettingCategory.slice';
import memoize from 'memoizee';

export const NOTIFICATION_SETTING_FEATURE_KEY = 'notificationsetting';

export interface NotificationSettingState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	notificationSetting?: INotificationSetting | null;
}

export const initialNotificationSettingState: NotificationSettingState = {
	loadingStatus: 'not loaded',
	notificationSetting: null,
};

const LIST_NOTIFI_CHANEL_CACHED_TIME = 1000 * 60 * 3;
export const fetchNotificationSetting = memoize(
	(mezon: MezonValueContext, channelID: string) =>
		mezon.client.getNotificationChannel(mezon.session, channelID),
	{
		promise: true,
		maxAge: LIST_NOTIFI_CHANEL_CACHED_TIME,
		normalizer: (args) => {
			return args[1];
		},
	},
);

type fetchNotificationSettingsArgs = {
	channelId: string;
	noCache?: boolean;
};

export const getNotificationSetting = createAsyncThunk('notificationsetting/getNotificationSetting', async ({channelId, noCache}:fetchNotificationSettingsArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	if (noCache) {
		fetchNotificationSetting.clear(mezon, channelId);
	}
	const response = await fetchNotificationSetting(mezon, channelId);
	if (!response) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return response;
});

type SetNotificationPayload = {
	channel_id?: string;
	notification_type?: string;
	time_mute?: string;
	clan_id: string;
};

export const setNotificationSetting = createAsyncThunk(
	'notificationsetting/setNotificationSetting',
	async ({ channel_id, notification_type, time_mute, clan_id }: SetNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			channel_id: channel_id,
			notification_type: notification_type,
			time_mute: time_mute,
		};
		const response = await mezon.client.setNotificationChannel(mezon.session, body);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(defaultNotificationCategoryActions.fetchChannelCategorySetting({ clanId: clan_id || '' }));
		thunkAPI.dispatch(getNotificationSetting({channelId: channel_id||"", noCache: true}));
		return response;
	},
);

type SetMuteNotificationPayload = {
	channel_id?: string;
	notification_type?: string;
	active: number;
	clan_id: string;
};

export const setMuteNotificationSetting = createAsyncThunk(
	'notificationsetting/setMuteNotificationSetting',
	async ({ channel_id, notification_type, active, clan_id }: SetMuteNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			channel_id: channel_id,
			notification_type: notification_type,
			active: active,
		};
		const response = await mezon.client.setMuteNotificationChannel(mezon.session, body);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(defaultNotificationCategoryActions.fetchChannelCategorySetting({ clanId: clan_id || '' }));
		thunkAPI.dispatch(getNotificationSetting({channelId: channel_id || '', noCache: true}));
		return response;
	},
);

type DeleteNotiChannelSettingPayload = {
	channel_id?: string;
	clan_id?: string;
};

export const deleteNotiChannelSetting = createAsyncThunk(
	'notificationsetting/deleteNotiChannelSetting',
	async ({ channel_id, clan_id }: DeleteNotiChannelSettingPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteNotificationChannel(mezon.session, channel_id || '');
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(defaultNotificationCategoryActions.fetchChannelCategorySetting({ clanId: clan_id || '' }));
		thunkAPI.dispatch(getNotificationSetting({channelId: channel_id || '', noCache: true}));
		return response;
	},
);

export const notificationSettingSlice = createSlice({
	name: NOTIFICATION_SETTING_FEATURE_KEY,
	initialState: initialNotificationSettingState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getNotificationSetting.pending, (state: NotificationSettingState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(getNotificationSetting.fulfilled, (state: NotificationSettingState, action: PayloadAction<ApiNotificationUserChannel>) => {
				state.notificationSetting = action.payload;
				state.loadingStatus = 'loaded';
			})
			.addCase(getNotificationSetting.rejected, (state: NotificationSettingState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const notificationSettingReducer = notificationSettingSlice.reducer;

export const notificationSettingActions = {
	...notificationSettingSlice.actions,
	getNotificationSetting,
	setNotificationSetting,
	deleteNotiChannelSetting,
	setMuteNotificationSetting,
};

export const getNotificationSettingState = (rootState: { [NOTIFICATION_SETTING_FEATURE_KEY]: NotificationSettingState }): NotificationSettingState =>
	rootState[NOTIFICATION_SETTING_FEATURE_KEY];

export const selectnotificatonSelected = createSelector(getNotificationSettingState, (state: NotificationSettingState) => state.notificationSetting);
