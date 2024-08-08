import { LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import memoizee from 'memoizee';
import { ApiWebhook, ApiWebhookCreateRequest, MezonUpdateWebhookByIdBody } from 'mezon-js/api.gen';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';

export const INTEGRATION_WEBHOOK = 'integrationWebhook';

export interface IWebHookState {
	loadingStatus: LoadingStatus;
	errors?: string | null;
	webhookList?: Array<ApiWebhook>;
}

export interface IFetchWebhooksByChannelIdArg {
	channelId: string;
	clanId: string;
	noCache?: boolean;
}

export const initialWebhookState: IWebHookState = {
	loadingStatus: 'not loaded',
	errors: null,
	webhookList: [],
};

const LIST_WEBHOOK_CACHED_TIME = 1000 * 60 * 3;

const fetchWebhooksCached = memoizee(
	(mezon: MezonValueContext, channelId: string, clanId: string) => mezon.client.listWebhookByChannelId(mezon.session, channelId, clanId),
	{
		promise: true,
		maxAge: LIST_WEBHOOK_CACHED_TIME,
		normalizer: (args) => {
			return args[2] + args[1] + args[0].session.username;
		},
	},
);

export const fetchWebhooksByChannelId = createAsyncThunk(
	'integration/fetchWebhooks',
	async ({ channelId, clanId, noCache }: IFetchWebhooksByChannelIdArg, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			if (noCache) {
				fetchWebhooksCached.clear(mezon, channelId, clanId);
			}
			const response = await fetchWebhooksCached(mezon, channelId, clanId);
			return response.webhooks;
		} catch (error) {
			console.log(error);
			return thunkAPI.rejectWithValue({});
		}
	},
);

export const generateWebhook = createAsyncThunk(
	'integration/createWebhook',
	async (data: { request: ApiWebhookCreateRequest; channelId: string; clanId: string }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.generateWebhookLink(mezon.session, data.request);
			if (response) {
				thunkAPI.dispatch(fetchWebhooksByChannelId({ channelId: data.channelId, clanId: data.clanId, noCache: true }));
			} else {
				thunkAPI.rejectWithValue({});
			}
			alert(`Generated ${response.hook_name} successfully !`);
		} catch (error) {
			console.log(error);
			return thunkAPI.rejectWithValue({});
		}
	},
);

export const deleteWebhookById = createAsyncThunk('integration/deleteWebhook', async (webhook: ApiWebhook, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteWebhookById(mezon.session, webhook.id as string);
		if (response) {
			return webhook;
		}
		thunkAPI.rejectWithValue({});
	} catch (err) {
		console.log(err);
		return thunkAPI.rejectWithValue(err);
	}
});

export const updateWebhookBySpecificId = createAsyncThunk(
	'integration/editWebhook',
	async (data: { request: MezonUpdateWebhookByIdBody; webhookId: string | undefined; channelId: string; clanId: string }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.updateWebhookById(mezon.session, data.webhookId as string, data.request);
			if (response) {
				thunkAPI.dispatch(fetchWebhooksByChannelId({ channelId: data.channelId, noCache: true, clanId: data.clanId }));
			}
		} catch (err) {
			console.log(err);
			return thunkAPI.rejectWithValue(err);
		}
	},
);

export const integrationWebhookSlice = createSlice({
	name: INTEGRATION_WEBHOOK,
	initialState: initialWebhookState,
	reducers: {},
	extraReducers(builder) {
		builder
			.addCase(fetchWebhooksByChannelId.pending, (state) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchWebhooksByChannelId.fulfilled, (state, action) => {
				state.loadingStatus = 'loaded';
				state.webhookList = action.payload;
			})
			.addCase(fetchWebhooksByChannelId.rejected, (state) => {
				state.loadingStatus = 'error';
			})
			.addCase(deleteWebhookById.fulfilled, (state, action) => {
				state.webhookList = state.webhookList?.filter((webhook) => webhook.id !== action.payload?.id);
			});
	},
});

export const getWebHookState = (rootState: { [INTEGRATION_WEBHOOK]: IWebHookState }): IWebHookState => rootState[INTEGRATION_WEBHOOK];
export const selectAllWebhooks = createSelector(getWebHookState, (state) => state?.webhookList || []);
export const integrationWebhookReducer = integrationWebhookSlice.reducer;
