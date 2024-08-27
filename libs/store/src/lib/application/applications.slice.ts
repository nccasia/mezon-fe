import { LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import memoizee from 'memoizee';
import { ApiAddAppRequest, ApiApp, ApiAppList } from 'mezon-js/api.gen';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';

export const ADMIN_APPLICATIONS = 'adminApplication';

export interface IApplicationState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	appsData: ApiAppList;
	appDetail: ApiApp;
}

export const applicationInitialState: IApplicationState = {
	loadingStatus: 'not loaded',
	error: null,
	appsData: {
		apps: [],
		next_cursor: undefined,
		total_count: undefined,
	},
	appDetail: {
		id: '',
		applogo: undefined,
		appname: undefined,
		creator_id: undefined,
		disable_time: undefined,
		is_shadow: undefined,
		role: undefined,
		token: undefined,
	},
};

const FETCH_CACHED_TIME = 3 * 60 * 1000;

export interface IFetchAppsArg {
	noCache?: boolean;
}

const fetchApplicationsCached = memoizee((mezon: MezonValueContext) => mezon.client.listApps(mezon.session), {
	promise: true,
	maxAge: FETCH_CACHED_TIME,
	normalizer: (args) => {
		return args[0].session.username as string;
	},
});

export const fetchApplications = createAsyncThunk('adminApplication/fetchApplications', async ({ noCache }: IFetchAppsArg, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		if (noCache) {
			fetchApplicationsCached.clear(mezon);
		}
		const response = await fetchApplicationsCached(mezon);
		return response;
	} catch (err) {
		console.log(err);
		return thunkAPI.rejectWithValue({});
	}
});

export const getApplicationDetail = createAsyncThunk('adminApplication/getApplicationDetail', async ({appId}: {appId: string}, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.getApp(mezon.session, appId);
		return response;
	} catch (err) {
		return thunkAPI.rejectWithValue({ err });
	}
});

export const createApplication = createAsyncThunk('adminApplication/createApplication', async (data: { request: ApiAddAppRequest }, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.addApp(mezon.session, data.request);
		if (response) {
			thunkAPI.dispatch(fetchApplications({ noCache: true }));
		} else {
			thunkAPI.rejectWithValue({});
		}
	} catch (err) {
		console.log(err);
		return thunkAPI.rejectWithValue({ err });
	}
});

export const addBotChat = createAsyncThunk('adminApplication/addBotChat', async (data: { appId: string, clanId: string }, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		await mezon.client.addAppToClan(mezon.session, data.appId, data.clanId);
	} catch (err) {
		console.log(err);
		return thunkAPI.rejectWithValue({ err });
	}
});

export const adminApplicationSlice = createSlice({
	name: ADMIN_APPLICATIONS,
	initialState: applicationInitialState,
	reducers: {},
	extraReducers(builder) {
		builder.addCase(fetchApplications.pending, (state) => {
			state.loadingStatus = 'loading';
		});
		builder.addCase(fetchApplications.fulfilled, (state, action) => {
			state.appsData = action.payload;
			state.loadingStatus = 'loaded';
		});
		builder.addCase(fetchApplications.rejected, (state) => {
			state.loadingStatus = 'not loaded';
		});
		builder.addCase(getApplicationDetail.fulfilled, (state, action) => {
			state.appDetail = action.payload;
		});
	},
});

export const getApplicationState = (rootState: { [ADMIN_APPLICATIONS]: IApplicationState }): IApplicationState => rootState[ADMIN_APPLICATIONS];
export const selectAllApps = createSelector(getApplicationState, (state) => state.appsData || []);
export const selectAppDetail = createSelector(getApplicationState, (state) => state.appDetail);
export const adminApplicationReducer = adminApplicationSlice.reducer;

export const selectAppById = (appId: string) => 
	createSelector(selectAllApps, allApp => allApp.apps?.find(app => app.id === appId) || null);
