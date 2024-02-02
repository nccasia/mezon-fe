import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { IClan, LoadingStatus } from "@mezon/utils";
import {
  ApiClanDesc,
  ApiInviteUserRes,
  ApiLinkInviteUser,
} from "@mezon/mezon-js/dist/api.gen";
import { ensureClient, ensureSession, getMezonCtx } from "../helpers";
import { categoriesActions } from "../categories/categories.slice";
import { channelsActions } from "../channels/channels.slice";
import { userClanProfileActions } from "../clanProfile/clanProfile.slice";
export const CLANS_FEATURE_KEY = "clans";

/*
 * Update these interfaces according to your requirements.
 */

export interface ClansEntity extends IClan {
  id: string; // Primary ID
}

export const mapClanToEntity = (clanRes: ApiClanDesc) => {
  return { ...clanRes, id: clanRes.clan_id || "" };
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

export const changeCurrentClan = createAsyncThunk(
  "clans/changeCurrentClan",
  async ({ clanId }: ChangeCurrentClanArgs, thunkAPI) => {
    thunkAPI.dispatch(channelsActions.setCurrentChannelId(""));
    thunkAPI.dispatch(clansActions.setCurrentClanId(clanId));
    thunkAPI.dispatch(categoriesActions.fetchCategories({ clanId }));
    thunkAPI.dispatch(channelsActions.fetchChannels({ clanId }));
    thunkAPI.dispatch(userClanProfileActions.fetchUserClanProfile({ clanId }));
  },
);

export const fetchClans = createAsyncThunk<ClansEntity[]>(
  "clans/fetchClans",
  async (_, thunkAPI) => {
    const mezon = await ensureSession(getMezonCtx(thunkAPI));
    const response = await mezon.client.listClanDescs(
      mezon.session,
      100,
      1,
      "",
    );

    if (!response.clandesc) {
      return thunkAPI.rejectWithValue([]);
    }

    const clans = response.clandesc.map(mapClanToEntity);
    return clans;
  },
);

type CreatePayload = {
  clan_name: string;
  logo?: string;
};

export const createClan = createAsyncThunk(
  "clans/createClans",
  async ({ clan_name, logo }: CreatePayload, thunkAPI) => {
    const mezon = await ensureSession(getMezonCtx(thunkAPI));
    const body = {
      banner: "",
      clan_name: clan_name,
      creator_id: "",
      logo: logo || "",
    };
    const response = await mezon.client.createClanDesc(mezon.session, body);
    if (!response) {
      return thunkAPI.rejectWithValue([]);
    }
    return mapClanToEntity(response);
  },
);

type UpdateLinkUser = {
  user_name: string;
  avatar_url: string;
  display_name: string;
};

export const updateUser = createAsyncThunk(
  "clans/updateUser",
  async ({ user_name, avatar_url, display_name }: UpdateLinkUser, thunkAPI) => {
    const mezon = ensureClient(getMezonCtx(thunkAPI));
    const body = {
      avatar_url: avatar_url || "",
      display_name: display_name || "",
      lang_tag: "en",
      location: "",
      timezone: "",
      username: user_name,
    };
    const response = await mezon.client.updateAccount(mezon.session, body);
    if (!response) {
      return thunkAPI.rejectWithValue([]);
    }
    return response as true;
  },
);

export type CreateLinkInviteUser = {
  channel_id: string;
  clan_id: string;
  expiry_time: number;
};

export const createLinkInviteUser = createAsyncThunk(
  "clans/invite",
  async (
    { channel_id, clan_id, expiry_time }: CreateLinkInviteUser,
    thunkAPI,
  ) => {
    const mezon = await ensureSession(getMezonCtx(thunkAPI));
    const body = {
      channel_id: channel_id,
      clan_id: clan_id,
      expiry_time: expiry_time,
    };
    const response = await mezon.client.createLinkInviteUser(
      mezon.session,
      body,
    );
    if (!response) {
      return thunkAPI.rejectWithValue([]);
    }
    return response as ApiLinkInviteUser;
  },
);

type InviteUser = {
  inviteId: string;
};

export const inviteUser = createAsyncThunk(
  "clans/inviteUser",
  async ({ inviteId }: InviteUser, thunkAPI) => {
    const mezon = await ensureSession(getMezonCtx(thunkAPI));
    const response = await mezon.client.inviteUser(mezon.session, inviteId);
    if (!response) {
      return thunkAPI.rejectWithValue([]);
    }
    return response as ApiInviteUserRes;
  },
);

export const getLinkInvite = createAsyncThunk(
  "clans/getLinkInvite",
  async ({ inviteId }: InviteUser, thunkAPI) => {
    const mezon = await ensureSession(getMezonCtx(thunkAPI));
    const response = await mezon.client.getLinkInvite(mezon.session, inviteId);
    if (!response) {
      return thunkAPI.rejectWithValue([]);
    }
    return response as ApiInviteUserRes;
  },
);

// export interface ApiLinkInviteUser {
//   channel_id?: string;
//   clan_id?: string;
//   create_time?: string;
//   creator_id?: string;
//   expiry_time?: string;
//   id?: string;
//   invite_link?: string;
// }

export const initialClansState: ClansState = clansAdapter.getInitialState({
  loadingStatus: "not loaded",
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
        state.loadingStatus = "loading";
      })
      .addCase(
        fetchClans.fulfilled,
        (state: ClansState, action: PayloadAction<IClan[]>) => {
          clansAdapter.setAll(state, action.payload);
          state.loadingStatus = "loaded";
        },
      )
      .addCase(fetchClans.rejected, (state: ClansState, action) => {
        state.loadingStatus = "error";
        state.error = action.error.message;
      });

    builder
      .addCase(createClan.pending, (state: ClansState) => {
        state.loadingStatus = "loading";
      })
      .addCase(
        createClan.fulfilled,
        (state: ClansState, action: PayloadAction<IClan>) => {
          console.log("Response: ", action.payload);
          clansAdapter.addOne(state, action.payload);
          state.loadingStatus = "loaded";
        },
      )
      .addCase(createClan.rejected, (state: ClansState, action) => {
        state.loadingStatus = "error";
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
  createLinkInviteUser,
  inviteUser,
  getLinkInvite,
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

export const getClansState = (rootState: {
  [CLANS_FEATURE_KEY]: ClansState;
}): ClansState => rootState[CLANS_FEATURE_KEY];
export const selectAllClans = createSelector(getClansState, selectAll);
export const selectCurrentClanId = createSelector(
  getClansState,
  (state) => state.currentClanId,
);

export const selectClansEntities = createSelector(
  getClansState,
  selectEntities,
);

export const selectClanById = (id: string) =>
  createSelector(selectClansEntities, (clansEntities) => clansEntities[id]);

export const selectLoadingStatus = createSelector(
  getClansState,
  (state) => state.loadingStatus,
);

export const selectCurrentClan = createSelector(
  selectClansEntities,
  selectCurrentClanId,
  (clansEntities, clanId) => (clanId ? clansEntities[clanId] : null),
);

export const selectDefaultClanId = createSelector(selectAllClans, (clans) =>
  clans.length > 0 ? clans[0].id : null,
);
