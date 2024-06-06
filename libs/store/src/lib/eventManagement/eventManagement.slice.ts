import { IEventManagement, LoadingStatus } from "@mezon/utils";
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';
import memoize from 'memoizee';
import { ApiEventManagement } from "mezon-js/api.gen";

export const EVENT_MANAGEMENT_FEATURE_KEY = 'eventmanagement';

export interface EventManagementEntity extends IEventManagement {
	id: string;
}

export const eventManagementAdapter = createEntityAdapter<EventManagementEntity>();

const EVENT_MANAGEMENT_CACHED_TIME = 1000 * 60 * 3;
const fetchEventManagementCached = memoize(
	(mezon: MezonValueContext, clanId: string) => mezon.client.listEvents(mezon.session, clanId),
	{
		promise: true,
		maxAge: EVENT_MANAGEMENT_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[0].session.token;
		},
	},
);

export const mapEventManagementToEntity = (eventRes: ApiEventManagement, clanId?: string) => {
	return { ...eventRes, id: eventRes.id || '', clanId };
};

type fetchEventManagementPayload = {
	clanId: string;
	noCache?: boolean;
};

export const fetchEventManagement = createAsyncThunk(
	'eventManagement/fetchEventManagement',
	async ({ clanId, noCache }: fetchEventManagementPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		if (noCache) {
			fetchEventManagementCached.clear(mezon, clanId);
		}

		const response = await fetchEventManagementCached(mezon, clanId);
		
		if (!response.events) {
			thunkAPI.dispatch(eventManagementActions.clearEntities());
			return thunkAPI.rejectWithValue([]);
		}

		const events = response.events.map((eventRes) => mapEventManagementToEntity(eventRes, clanId));
		return events;
	},
);

type CreateEventManagementyload = {
	clan_id: string,
	channel_id: string, 
	address: string, 
	title: string, 
	start_time: string, 
	end_time: string, 
	description: string,
	logo: string,
};

export const fetchCreateEventManagement = createAsyncThunk(
	'CreatEventManagement/fetchCreateEventManagement',
	async ({ clan_id, channel_id, address, title, start_time, end_time, description, logo }: CreateEventManagementyload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			clan_id: clan_id,
			channel_id: channel_id || '',
			address: address || '',
			title: title,
			start_time: start_time,
			end_time: end_time,
			description: description || '',
			logo: logo || '',
		}
		const response = await mezon.client.createEvent(mezon.session, body);
		if(response){
			thunkAPI.dispatch(fetchEventManagement({ clanId: clan_id, noCache: true}));
		}
		else {
			return thunkAPI.rejectWithValue([]);
		}
		return response;
	},
);

export interface EventManagementState extends EntityState<EventManagementEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const initialEventManagementState: EventManagementState = eventManagementAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
});

export const eventManagementSlice = createSlice({
	name: EVENT_MANAGEMENT_FEATURE_KEY,
	initialState: initialEventManagementState,
	reducers: {
		add: eventManagementAdapter.addOne,
		addMany: eventManagementAdapter.addMany,
		remove: eventManagementAdapter.removeOne,
		clearEntities: (state) => {
			eventManagementAdapter.removeAll(state);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEventManagement.pending, (state: EventManagementState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchEventManagement.fulfilled, (state: EventManagementState, action: PayloadAction<any>) => {
				eventManagementAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchEventManagement.rejected, (state: EventManagementState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

export const eventManagementReducer = eventManagementSlice.reducer;

export const eventManagementActions = {
	...eventManagementSlice.actions,
	fetchEventManagement,
	fetchCreateEventManagement,
};

const { selectAll, selectEntities } = eventManagementAdapter.getSelectors();

export const getEventManagementState = (rootState: { [EVENT_MANAGEMENT_FEATURE_KEY]: EventManagementState }): EventManagementState => rootState[EVENT_MANAGEMENT_FEATURE_KEY];

export const selectAllEventManagement = createSelector(getEventManagementState, selectAll);

export const selectEventManagementEntities = createSelector(getEventManagementState, selectEntities);

export const selectNumberEvent = createSelector(selectAllEventManagement, (events) => events.length);


