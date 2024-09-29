import { IClan, LIMIT_CLAN_ITEM, LoadingStatus, TypeCheck } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/browser';
import { ApiUpdateClanDescRequest, ChannelType } from 'mezon-js';
import { ApiClanDesc } from 'mezon-js/api.gen';
import { accountActions } from '../account/account.slice';
import { categoriesActions } from '../categories/categories.slice';
import { fetchListChannelsByUser } from '../channels/channelUser.slice';
import { channelsActions } from '../channels/channels.slice';
import { usersClanActions } from '../clanMembers/clan.members';
import { eventManagementActions } from '../eventManagement/eventManagement.slice';
import { ensureClient, ensureSession, ensureSocket, getMezonCtx } from '../helpers';
import { defaultNotificationCategoryActions } from '../notificationSetting/notificationSettingCategory.slice';
import { defaultNotificationActions } from '../notificationSetting/notificationSettingClan.slice';
import { policiesActions } from '../policies/policies.slice';
import { rolesClanActions } from '../roleclan/roleclan.slice';
import { channelsStreamActions } from '../stream/channelsStream.slice';
import { usersStreamActions } from '../stream/usersStream.slice';
import { voiceActions } from '../voice/voice.slice';

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

interface ClanMeta {
	id: string;
	showNumEvent: boolean;
}

const clanMetaAdapter = createEntityAdapter<ClanMeta>();

function extractClanMeta(clan: ClansEntity): ClanMeta {
	return {
		id: clan.id,
		showNumEvent: true
	};
}

export interface ClansState extends EntityState<ClansEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	currentClanId?: string | null;
	clanMetadata: EntityState<ClanMeta, string>;
}

export const clansAdapter = createEntityAdapter<ClansEntity>();

export type ChangeCurrentClanArgs = {
	clanId: string;
	noCache?: boolean;
};

export const changeCurrentClan = createAsyncThunk<void, ChangeCurrentClanArgs>(
	'clans/changeCurrentClan',
	async ({ clanId, noCache = false }: ChangeCurrentClanArgs, thunkAPI) => {
		thunkAPI.dispatch(channelsActions.setCurrentChannelId(''));
		thunkAPI.dispatch(clansActions.setCurrentClanId(clanId));
		thunkAPI.dispatch(categoriesActions.fetchCategories({ clanId }));
		thunkAPI.dispatch(usersClanActions.fetchUsersClan({ clanId }));
		thunkAPI.dispatch(rolesClanActions.fetchRolesClan({ clanId }));
		thunkAPI.dispatch(eventManagementActions.fetchEventManagement({ clanId }));
		thunkAPI.dispatch(policiesActions.fetchPermissionsUser({ clanId }));
		thunkAPI.dispatch(policiesActions.fetchPermission());
		thunkAPI.dispatch(defaultNotificationCategoryActions.fetchChannelCategorySetting({ clanId }));
		thunkAPI.dispatch(defaultNotificationActions.getDefaultNotificationClan({ clanId: clanId }));
		thunkAPI.dispatch(channelsActions.fetchChannels({ clanId, noCache: true }));
		thunkAPI.dispatch(
			voiceActions.fetchVoiceChannelMembers({
				clanId: clanId ?? '',
				channelId: '',
				channelType: ChannelType.CHANNEL_TYPE_VOICE
			})
		);
		thunkAPI.dispatch(channelsStreamActions.listStreamChannels({ clanId }));
		thunkAPI.dispatch(
			usersStreamActions.fetchStreamChannelMembers({
				clanId: clanId ?? '',
				channelId: '',
				channelType: ChannelType.CHANNEL_TYPE_STREAMING
			})
		);
	}
);

export const fetchClans = createAsyncThunk<ClansEntity[]>('clans/fetchClans', async (_, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.listClanDescs(mezon.session, LIMIT_CLAN_ITEM, 1, '');

		if (!response.clandesc) {
			return [];
		}
		thunkAPI.dispatch(fetchListChannelsByUser());
		const clans = response.clandesc.map(mapClanToEntity);
		const meta = clans.map((clan) => extractClanMeta(clan));
		thunkAPI.dispatch(clansActions.updateBulkClanMetadata(meta));
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
			logo: logo ?? ''
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

export const checkDuplicateNameClan = createAsyncThunk('clans/duplicateNameClan', async (clan_name: string, thunkAPI) => {
	try {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));
		const isDuplicateName = await mezon.socketRef.current?.checkDuplicateName(clan_name, '', TypeCheck.TYPECLAN);

		if (isDuplicateName?.type === TypeCheck.TYPECLAN) {
			return isDuplicateName.exist;
		}
		return;
	} catch (error: any) {
		Sentry.captureException(error);
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

export const deleteClan = createAsyncThunk('clans/deleteClans', async (body: ChangeCurrentClanArgs, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteClanDesc(mezon.session, body.clanId);
		if (response) {
			thunkAPI.dispatch(fetchClans());
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

type removeClanUsersPayload = {
	clanId: string;
	userIds: string[];
};

export const removeClanUsers = createAsyncThunk('clans/removeClanUsers', async ({ clanId, userIds }: removeClanUsersPayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.removeClanUsers(mezon.session, clanId, userIds);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(fetchClans());
		return response;
	} catch (error: any) {
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

export const updateClan = createAsyncThunk(
	'clans/updateClans',
	async ({ clan_id, banner, clan_name, creator_id, logo }: ApiUpdateClanDescRequest, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));

			const request: ApiUpdateClanDescRequest = {
				clan_id,
				creator_id,
				clan_name,
				logo,
				banner
			};

			const response = await mezon.client.updateClanDesc(mezon.session, clan_id, request);

			if (!response) {
				return thunkAPI.rejectWithValue([]);
			}

			thunkAPI.dispatch(fetchClans());
			return response;
		} catch (error: any) {
			const errmsg = await error.json();
			return thunkAPI.rejectWithValue(errmsg.message);
		}
	}
);

type UpdateLinkUser = {
	user_name: string;
	avatar_url: string;
	display_name: string;
	about_me: string;
	noCache?: boolean;
};

export const updateUser = createAsyncThunk(
	'clans/updateUser',
	async ({ user_name, avatar_url, display_name, about_me, noCache = false }: UpdateLinkUser, thunkAPI) => {
		try {
			const mezon = ensureClient(getMezonCtx(thunkAPI));
			const body = {
				avatar_url: avatar_url || '',
				display_name: display_name || '',
				lang_tag: 'en',
				location: '',
				timezone: '',
				username: user_name,
				about_me: about_me
			};
			const response = await mezon.client.updateAccount(mezon.session, body);
			if (!response) {
				return thunkAPI.rejectWithValue([]);
			}
			if (response) {
				thunkAPI.dispatch(accountActions.getUserProfile({ noCache: true }));
			}
			return response as true;
		} catch (error: any) {
			const errmsg = await error.json();
			return thunkAPI.rejectWithValue(errmsg.message);
		}
	}
);
interface JoinClanPayload {
	clanId: string;
}
export const joinClan = createAsyncThunk<void, JoinClanPayload>('direct/joinClan', async ({ clanId }, thunkAPI) => {
	try {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));
		await mezon.socketRef.current?.joinClanChat(clanId);
	} catch (error) {
		Sentry.captureException(error);
		return thunkAPI.rejectWithValue(error);
	}
});

export const initialClansState: ClansState = clansAdapter.getInitialState({
	loadingStatus: 'not loaded',
	clans: [],
	error: null,
	clanMetadata: clanMetaAdapter.getInitialState()
});

export const clansSlice = createSlice({
	name: CLANS_FEATURE_KEY,
	initialState: initialClansState,
	reducers: {
		add: clansAdapter.addOne,
		remove: clansAdapter.removeOne,
		removeAll: clansAdapter.removeAll,
		setCurrentClanId: (state, action: PayloadAction<string>) => {
			state.currentClanId = action.payload;
		},
		updateBulkClanMetadata: (state, action: PayloadAction<ClanMeta[]>) => {
			state.clanMetadata = clanMetaAdapter.upsertMany(state.clanMetadata, action.payload);
		},
		setClanShowNumEvent: (state, action: PayloadAction<{ clanId: string; status: boolean }>) => {
			const clan = state.clanMetadata.entities[action.payload.clanId];
			if (clan) {
				clan.showNumEvent = action.payload.status;
			}
		},
		removeByClanID: (state, action: PayloadAction<string>) => {
			clansAdapter.removeOne(state, action.payload);
		}
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
		builder.addCase(deleteClan.pending, (state: ClansState) => {
			state.loadingStatus = 'loading';
		});
		builder.addCase(deleteClan.fulfilled, (state: ClansState) => {
			state.loadingStatus = 'loaded';
		});
		builder.addCase(deleteClan.rejected, (state: ClansState, action) => {
			state.loadingStatus = 'error';
			state.error = action.error.message;
		});
	}
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
	updateClan,
	removeClanUsers,
	changeCurrentClan,
	updateUser,
	deleteClan,
	joinClan
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
	clanId ? clansEntities[clanId] : null
);

export const selectDefaultClanId = createSelector(selectAllClans, (clans) => (clans.length > 0 ? clans[0].id : null));

export const selectShowNumEvent = (clanId: string) =>
	createSelector(getClansState, (state) => {
		const clan = state.clanMetadata.entities[clanId];
		return clan?.showNumEvent || false;
	});

export const selectClanByUserId = (userId: string) => createSelector(selectAllClans, (clans) => clans.filter((clan) => clan.creator_id === userId));
