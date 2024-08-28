import { IChannelCategorySetting, IDefaultNotificationCategory, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { NotificationChannelCategorySetting } from 'mezon-js';
import { ApiNotificationSetting } from 'mezon-js/api.gen';
import { ensureSession, ensureSocket, getMezonCtx } from '../helpers';
export const DEFAULT_NOTIFICATION_CATEGORY_FEATURE_KEY = 'defaultnotificationcategory';

export interface DefaultNotificationCategoryState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	defaultNotificationCategory?: IDefaultNotificationCategory | null;
}

export const initialDefaultNotificationCategoryState: DefaultNotificationCategoryState = {
	loadingStatus: 'not loaded',
	defaultNotificationCategory: null
};

type fetchNotificationCategorySettingsArgs = {
	categoryId: string;
};

export const getDefaultNotificationCategory = createAsyncThunk(
	'defaultnotificationcategory/getDefaultNotificationCategory',
	async ({ categoryId }: fetchNotificationCategorySettingsArgs, thunkAPI) => {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));
		const response = await mezon.socketRef.current?.getNotificationCategorySetting(categoryId);

		if (!response) {
			return thunkAPI.rejectWithValue('Invalid session');
		}

		const apiNotificationSetting = response.notification_user_channel
			? {
					id: response.notification_user_channel.id,
					notification_setting_type: response.notification_user_channel.notification_setting_type,
					active: response.notification_user_channel.active,
					time_mute: response.notification_user_channel.time_mute
				}
			: {};

		return apiNotificationSetting;
	}
);

export type SetDefaultNotificationPayload = {
	category_id?: string;
	notification_type?: number;
	time_mute?: string;
	clan_id: string;
	active?: number;
};

export const setDefaultNotificationCategory = createAsyncThunk(
	'defaultnotificationcategory/setDefaultNotificationCategory',
	async ({ category_id, notification_type, time_mute, clan_id }: SetDefaultNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			channel_category_id: category_id,
			notification_type: notification_type,
			time_mute: time_mute
		};
		const response = await mezon.client.setNotificationCategory(mezon.session, body);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(fetchChannelCategorySetting({ clanId: clan_id || '' }));
		thunkAPI.dispatch(getDefaultNotificationCategory({ categoryId: category_id || '' }));
		return response;
	}
);

type DeleteDefaultNotificationPayload = {
	category_id?: string;
	clan_id?: string;
};

export const deleteDefaultNotificationCategory = createAsyncThunk(
	'defaultnotificationcategory/deleteDefaultNotificationCategory',
	async ({ category_id, clan_id }: DeleteDefaultNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteNotificationCategory(mezon.session, category_id || '');
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(fetchChannelCategorySetting({ clanId: clan_id || '' }));
		thunkAPI.dispatch(getDefaultNotificationCategory({ categoryId: category_id || '' }));
		return response;
	}
);

export const setMuteCategory = createAsyncThunk(
	'defaultnotificationcategory/setMuteCategory',
	async ({ category_id, notification_type, active, clan_id }: SetDefaultNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.setMuteNotificationCategory(mezon.session, {
			active: active,
			notification_type: notification_type,
			id: category_id
		});
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(fetchChannelCategorySetting({ clanId: clan_id || '' }));
		thunkAPI.dispatch(getDefaultNotificationCategory({ categoryId: category_id || '' }));
		return response;
	}
);

export const defaultNotificationCategorySlice = createSlice({
	name: DEFAULT_NOTIFICATION_CATEGORY_FEATURE_KEY,
	initialState: initialDefaultNotificationCategoryState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getDefaultNotificationCategory.pending, (state: DefaultNotificationCategoryState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(
				getDefaultNotificationCategory.fulfilled,
				(state: DefaultNotificationCategoryState, action: PayloadAction<ApiNotificationSetting>) => {
					state.defaultNotificationCategory = action.payload;
					state.loadingStatus = 'loaded';
				}
			)
			.addCase(getDefaultNotificationCategory.rejected, (state: DefaultNotificationCategoryState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});
//

export interface NotiChannelCategorySettingEntity extends IChannelCategorySetting {
	id: string; // Primary ID
}

export const mapChannelCategorySettingToEntity = (ChannelCategorySettingRes: NotificationChannelCategorySetting) => {
	const id = (ChannelCategorySettingRes as unknown as any).id;
	return { ...ChannelCategorySettingRes, id };
};

export interface ChannelCategorySettingState extends EntityState<NotiChannelCategorySettingEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const channelCategorySettingAdapter = createEntityAdapter<NotiChannelCategorySettingEntity>();

type fetchChannelCategorySettingPayload = {
	clanId: string;
};
export const fetchChannelCategorySetting = createAsyncThunk(
	'channelCategorySetting/fetchChannelCategorySetting',
	async ({ clanId }: fetchChannelCategorySettingPayload, thunkAPI) => {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));
		const response = await mezon.socketRef.current?.getNotificationChannelCategorySetting(clanId);

		if (!response?.notification_channel_category_settings_list) {
			return [];
		}
		return response.notification_channel_category_settings_list.map(mapChannelCategorySettingToEntity);
	}
);

export const initialChannelCategorySettingState: ChannelCategorySettingState = channelCategorySettingAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null
});

export const channelCategorySettingSlice = createSlice({
	name: 'notichannelcategorysetting',
	initialState: initialChannelCategorySettingState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannelCategorySetting.pending, (state: ChannelCategorySettingState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(
				fetchChannelCategorySetting.fulfilled,
				(state: ChannelCategorySettingState, action: PayloadAction<IChannelCategorySetting[]>) => {
					channelCategorySettingAdapter.setAll(state, action.payload);
					state.loadingStatus = 'loaded';
				}
			)
			.addCase(fetchChannelCategorySetting.rejected, (state: ChannelCategorySettingState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const channelCategorySettingReducer = channelCategorySettingSlice.reducer;
export const defaultNotificationCategoryReducer = defaultNotificationCategorySlice.reducer;

export const defaultNotificationCategoryActions = {
	...defaultNotificationCategorySlice.actions,
	getDefaultNotificationCategory,
	setDefaultNotificationCategory,
	deleteDefaultNotificationCategory,
	fetchChannelCategorySetting,
	setMuteCategory
};

export const getDefaultNotificationCategoryState = (rootState: {
	[DEFAULT_NOTIFICATION_CATEGORY_FEATURE_KEY]: DefaultNotificationCategoryState;
}): DefaultNotificationCategoryState => rootState[DEFAULT_NOTIFICATION_CATEGORY_FEATURE_KEY];

export const selectDefaultNotificationCategory = createSelector(
	getDefaultNotificationCategoryState,
	(state: DefaultNotificationCategoryState) => state.defaultNotificationCategory
);

const { selectAll } = channelCategorySettingAdapter.getSelectors();

export const getchannelCategorySettingListState = (rootState: {
	['notichannelcategorysetting']: ChannelCategorySettingState;
}): ChannelCategorySettingState => rootState['notichannelcategorysetting'];

export const selectAllchannelCategorySetting = createSelector(getchannelCategorySettingListState, selectAll);
