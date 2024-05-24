import { INotificationSetting, LoadingStatus } from '@mezon/utils';
import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { ensureSession, getMezonCtx } from '../helpers';
import { ApiNotificationUserChannel } from 'mezon-js/api.gen';
import { defaultNotificationCategoryActions } from './notificationSettingCategory.slice';

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

export const getNotificationSetting = createAsyncThunk('notificationsetting/getNotificationSetting', async (channelId: string, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.getNotificationChannel(mezon.session, channelId);
	if (!response) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return response;
});

type SetNotificationPayload = {
    channel_id?: string;
    notification_type?: string;
    time_mute?: string;
	clan_id:string;
};

export const setNotificationSetting = createAsyncThunk(
	'notificationsetting/setNotificationSetting',
	async ({ channel_id, notification_type, time_mute, clan_id}: SetNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			channel_id: channel_id,
			notification_type: notification_type,
			time_mute: time_mute,
		}
		const response = await mezon.client.setNotificationChannel(mezon.session, body);
		if (!response) {
			
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(defaultNotificationCategoryActions.fetchChannelCategorySetting({clanId: clan_id||""}))
		thunkAPI.dispatch(getNotificationSetting(channel_id || ""));
		return response;
	},
);

type DeleteNotiChannelSettingPayload = {
    channel_id?: string;
	clan_id?: string;
};

export const deleteNotiChannelSetting = createAsyncThunk(
	'notificationsetting/deleteNotiChannelSetting',
	async ({ channel_id, clan_id }:DeleteNotiChannelSettingPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteNotificationChannel(mezon.session, channel_id||"");
		if (!response) {
			
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(defaultNotificationCategoryActions.fetchChannelCategorySetting({clanId: clan_id||""}))
		thunkAPI.dispatch(getNotificationSetting(channel_id || ""));
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

export const notificationSettingActions = { ...notificationSettingSlice.actions, getNotificationSetting , setNotificationSetting, deleteNotiChannelSetting};

export const getNotificationSettingState = (rootState: { [NOTIFICATION_SETTING_FEATURE_KEY]: NotificationSettingState }): NotificationSettingState => rootState[NOTIFICATION_SETTING_FEATURE_KEY];

export const selectnotificatonSelected = createSelector(getNotificationSettingState, (state: NotificationSettingState) => state.notificationSetting);
