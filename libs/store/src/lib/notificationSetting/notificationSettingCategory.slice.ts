import { IChannelCategorySetting, IDefaultNotificationCategory, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ensureSession, getMezonCtx } from '../helpers';
import { ApiNotificationChannelCategoySetting, ApiNotificationSetting } from 'mezon-js/api.gen';

export const DEFAULT_NOTIFICATION_CATEGORY_FEATURE_KEY = 'defaultnotificationcategory';

export interface DefaultNotificationCategoryState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	defaultNotificationCategory?: IDefaultNotificationCategory | null;
}

export const initialDefaultNotificationCategoryState: DefaultNotificationCategoryState = {
	loadingStatus: 'not loaded',
	defaultNotificationCategory: null,
};

export const getDefaultNotificationCategory = createAsyncThunk('defaultnotificationcategory/getDefaultNotificationCategory', async (categoryId: string, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.getNotificationCategory(mezon.session, categoryId);
	if (!response) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return response;
});

type SetDefaultNotificationPayload = {
    category_id?: string;
    notification_type?: string;
	clan_id:string;
};

export const setDefaultNotificationCategory = createAsyncThunk(
	'defaultnotificationcategory/setDefaultNotificationCategory',
	async ({ category_id, notification_type, clan_id }: SetDefaultNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			category_id: category_id,
			notification_type: notification_type,
		}
		const response = await mezon.client.setNotificationCategory(mezon.session, body);
		if (!response) {
			
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(fetchChannelCategorySetting({clanId: clan_id ||""}))
		thunkAPI.dispatch(getDefaultNotificationCategory(category_id || ""));
		return response;
	},
);

type DeleteDefaultNotificationPayload = {
    category_id?: string;
	clan_id?: string;
};

export const deleteDefaultNotificationCategory = createAsyncThunk(
	'defaultnotificationcategory/deleteDefaultNotificationCategory',
	async ({ category_id, clan_id }:DeleteDefaultNotificationPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteNotificationCategory(mezon.session, category_id||"");
		if (!response) {
			
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(fetchChannelCategorySetting({clanId: clan_id ||""}))
		thunkAPI.dispatch(getDefaultNotificationCategory(category_id || ""));
		return response;
	},
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
			.addCase(getDefaultNotificationCategory.fulfilled, (state: DefaultNotificationCategoryState, action: PayloadAction<ApiNotificationSetting>) => {
				state.defaultNotificationCategory = action.payload;
				state.loadingStatus = 'loaded';
			})
			.addCase(getDefaultNotificationCategory.rejected, (state: DefaultNotificationCategoryState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});
//


export interface NotiChannelCategorySettingEntity extends IChannelCategorySetting {
	id: string; // Primary ID
}

export const mapChannelCategorySettingToEntity = (ChannelCategorySettingRes: ApiNotificationChannelCategoySetting) => {
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
export const fetchChannelCategorySetting = createAsyncThunk('channelCategorySetting/fetchChannelCategorySetting', async ({ clanId }: fetchChannelCategorySettingPayload, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.getChannelCategoryNotiSettingsList(mezon.session, clanId);
	if (!response.noti_channel_categoy_setting) {
		return thunkAPI.rejectWithValue([]);
	}
	return response.noti_channel_categoy_setting.map(mapChannelCategorySettingToEntity);
});


export const initialChannelCategorySettingState: ChannelCategorySettingState = channelCategorySettingAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
});
export const channelCategorySettingSlice = createSlice({
	name: "notichannelcategorysetting",
	initialState: initialChannelCategorySettingState,
	reducers: {
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannelCategorySetting.pending, (state: ChannelCategorySettingState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchChannelCategorySetting.fulfilled, (state: ChannelCategorySettingState, action: PayloadAction<IChannelCategorySetting[]>) => {
				channelCategorySettingAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchChannelCategorySetting.rejected, (state: ChannelCategorySettingState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});


export const channelCategorySettingReducer = channelCategorySettingSlice.reducer;
export const defaultNotificationCategoryReducer = defaultNotificationCategorySlice.reducer;

export const defaultNotificationCategoryActions = { ...defaultNotificationCategorySlice.actions, getDefaultNotificationCategory, setDefaultNotificationCategory, deleteDefaultNotificationCategory, fetchChannelCategorySetting };

export const getDefaultNotificationCategoryState = (rootState: { [DEFAULT_NOTIFICATION_CATEGORY_FEATURE_KEY]: DefaultNotificationCategoryState }): DefaultNotificationCategoryState => rootState[DEFAULT_NOTIFICATION_CATEGORY_FEATURE_KEY];

export const selectDefaultNotificationCategory = createSelector(getDefaultNotificationCategoryState, (state: DefaultNotificationCategoryState) => state.defaultNotificationCategory);



const { selectAll } = channelCategorySettingAdapter.getSelectors();

export const getchannelCategorySettingListState = (rootState: { ["notichannelcategorysetting"]: ChannelCategorySettingState }): ChannelCategorySettingState => rootState["notichannelcategorysetting"];

export const selectAllchannelCategorySetting = createSelector(getchannelCategorySettingListState, selectAll);
