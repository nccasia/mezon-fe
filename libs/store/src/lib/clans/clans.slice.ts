import { ApiClanDesc } from '@mezon/mezon-js/dist/api.gen';
import { IClan, LIMIT_CLAN_ITEM, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { getUserProfile } from '../account/account.slice';
import { categoriesActions } from '../categories/categories.slice';
import { channelsActions } from '../channels/channels.slice';
import { userClanProfileActions } from '../clanProfile/clanProfile.slice';
import { ensureClient, ensureSession, getMezonCtx } from '../helpers';
// import { PermissionsUserActions } from '../permissionuser/permissionuser.slice';
import { ChannelType } from '@mezon/mezon-js';
import { channelMembersActions } from '../channelmembers/channel.members';
import { usersClanActions } from '../clanMembers/clan.members';
import { policiesActions } from '../policies/policies.slice';
import { rolesClanActions } from '../roleclan/roleclan.slice';
export const CLANS_FEATURE_KEY = 'clans';

/*
 * Update these interfaces according to your requirements.
 */

export interface ClansEntity extends IClan {
	id: string; // Primary ID
}

export const mapClanToEntity = (clanRes: ApiClanDesc) => {
	return { ...clanRes, id: clanRes.clan_id || '' };
};

export interface ClansState extends EntityState<ClansEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	currentClanId?: string | null;
}

export const clansAdapter = createEntityAdapter<ClansEntity>();

export type ChangeCurrentClanArgs = {
	clanId: string;
};

export const changeCurrentClan = createAsyncThunk('clans/changeCurrentClan', async ({ clanId }: ChangeCurrentClanArgs, thunkAPI) => {
	thunkAPI.dispatch(channelsActions.setCurrentChannelId(''));
	thunkAPI.dispatch(clansActions.setCurrentClanId(clanId));
	thunkAPI.dispatch(categoriesActions.fetchCategories({ clanId }));
	// thunkAPI.dispatch(PermissionsUserActions.fetchPermissionsUser({ clanId }));
	thunkAPI.dispatch(usersClanActions.fetchUsersClan({ clanId }));
	thunkAPI.dispatch(rolesClanActions.fetchRolesClan({ clanId }));
	thunkAPI.dispatch(policiesActions.fetchPermissionsUser({ clanId }));
	thunkAPI.dispatch(policiesActions.fetchPermission());
	thunkAPI.dispatch(channelsActions.fetchChannels({ clanId }));
	thunkAPI.dispatch(userClanProfileActions.fetchUserClanProfile({ clanId }));
	thunkAPI.dispatch(
		channelMembersActions.fetchVoiceChannelMembers({
			clanId: clanId ?? '',
			channelId: '',
			noCache: false,
			channelType: 4,
		}),
	);
});

export const fetchClans = createAsyncThunk<ClansEntity[]>('clans/fetchClans', async (_, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.listClanDescs(mezon.session, LIMIT_CLAN_ITEM, 1, '');

		if (!response.clandesc) {
			return thunkAPI.rejectWithValue([]);
		}

		const clans = response.clandesc.map(mapClanToEntity);
		return clans;
	} catch (error: any) {
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

type CreatePayload = {
	clan_name: string;
	logo?: string;
};

export const createClan = createAsyncThunk('clans/createClans', async ({ clan_name, logo }: CreatePayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			banner: '',
			clan_name: clan_name,
			creator_id: '',
			logo: logo || '',
		};
		const response = await mezon.client.createClanDesc(mezon.session, body);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		return mapClanToEntity(response);
	} catch (error: any) {
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

type UpdateLinkUser = {
	user_name: string;
	avatar_url: string;
	display_name: string;
};

export const updateUser = createAsyncThunk('clans/updateUser', async ({ user_name, avatar_url, display_name }: UpdateLinkUser, thunkAPI) => {
	try {
		const mezon = ensureClient(getMezonCtx(thunkAPI));
		const body = {
			avatar_url: avatar_url || '',
			display_name: display_name || '',
			lang_tag: 'en',
			location: '',
			timezone: '',
			username: user_name,
		};
		const response = await mezon.client.updateAccount(mezon.session, body);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		if (response) {
			thunkAPI.dispatch(getUserProfile());
		}
		return response as true;
	} catch (error: any) {
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

export const initialClansState: ClansState = clansAdapter.getInitialState({
	loadingStatus: 'not loaded',
	clans: [],
	error: null,
});

export const clansSlice = createSlice({
	name: CLANS_FEATURE_KEY,
	initialState: initialClansState,
	reducers: {
		add: clansAdapter.addOne,
		remove: clansAdapter.removeOne,
		setCurrentClanId: (state, action: PayloadAction<string>) => {
			state.currentClanId = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchClans.pending, (state: ClansState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchClans.fulfilled, (state: ClansState, action: PayloadAction<IClan[]>) => {
				clansAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchClans.rejected, (state: ClansState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});

		builder
			.addCase(createClan.pending, (state: ClansState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(createClan.fulfilled, (state: ClansState, action: PayloadAction<IClan>) => {
				clansAdapter.addOne(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(createClan.rejected, (state: ClansState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const clansReducer = clansSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(clansActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const clansActions = {
	...clansSlice.actions,
	fetchClans,
	createClan,
	changeCurrentClan,
	updateUser,
};

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllClans);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = clansAdapter.getSelectors();

export const getClansState = (rootState: { [CLANS_FEATURE_KEY]: ClansState }): ClansState => rootState[CLANS_FEATURE_KEY];
export const selectAllClans = createSelector(getClansState, selectAll);
export const selectCurrentClanId = createSelector(getClansState, (state) => state.currentClanId);

export const selectClansEntities = createSelector(getClansState, selectEntities);

export const selectClanById = (id: string) => createSelector(selectClansEntities, (clansEntities) => clansEntities[id]);

export const selectCurrentClan = createSelector(selectClansEntities, selectCurrentClanId, (clansEntities, clanId) =>
	clanId ? clansEntities[clanId] : null,
);

export const selectDefaultClanId = createSelector(selectAllClans, (clans) => (clans.length > 0 ? clans[0].id : null));
