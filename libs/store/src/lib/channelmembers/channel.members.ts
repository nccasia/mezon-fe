import { IChannelMember, LoadingStatus } from '@mezon/utils';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { ensureSession, getMezonCtx } from '../helpers';
import { ChannelUserListChannelUser } from '@mezon/mezon-js/dist/api.gen';
import { ChannelPresenceEvent } from 'vendors/mezon-js/packages/mezon-js/dist';
import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';

export const CHANNEL_MEMBERS_FEATURE_KEY = 'channelMembers';

/*
 * Update these interfaces according to your requirements.
 */
export interface ChannelMembersEntity extends IChannelMember {
  id: string; // Primary ID
}

export const mapChannelMemberToEntity = (channelRes: ChannelUserListChannelUser) => {
  return { ...channelRes, id: channelRes?.user?.id || '' }
}

export const mapUserIdToEntity = (userId: string, username :string ) => {
  return {username: username, id:userId }
}


export interface ChannelMembersState extends EntityState<ChannelMembersEntity, string> {
  loadingStatus: LoadingStatus;
  error?: string | null;
  currentChannelId?: string | null;
}

export interface ChannelMemberRootState {
  [CHANNEL_MEMBERS_FEATURE_KEY]: ChannelMembersState;
}

function getChannelMemberRootState(thunkAPI: GetThunkAPI<unknown>): ChannelMemberRootState {
  return thunkAPI.getState() as ChannelMemberRootState;
}

export const channelMembersAdapter = createEntityAdapter<ChannelMembersEntity>();

/**
 * Export an effect using createAsyncThunk from
 * the Redux Toolkit: https://redux-toolkit.js.org/api/createAsyncThunk
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
 *   dispatch(fetchChannels())
 * }, [dispatch]);
 * ```
 */
type fetchChannelMembersPayload = {
  channelId: string
}

export const fetchChannelMembers = createAsyncThunk(
  'channelMembers/fetchStatus',
  async ({ channelId }: fetchChannelMembersPayload, thunkAPI) => {
    const mezon = await ensureSession(getMezonCtx(thunkAPI));
    const response = await mezon.client.listChannelUsers(mezon.session, channelId, 1, 100, "")
    if (!response.channel_users) {
      return thunkAPI.rejectWithValue([])
    }
    return response.channel_users.map(mapChannelMemberToEntity);
  }
);


export const fetchChannelMembersPresence = createAsyncThunk(
  'channelMembers/fetchChannelMembersPresence',
  async (channelPresence: ChannelPresenceEvent , thunkAPI) => {
    //user exist
    const userId = channelPresence.joins[0].user_id
    const channelId = channelPresence.channel_id

   const user = selectMemberById(userId)(getChannelMemberRootState(thunkAPI))

    if(!user){
      thunkAPI.dispatch(fetchChannelMembers({channelId}))
    }
  }
);

export const initialChannelMembersState: ChannelMembersState =
  channelMembersAdapter.getInitialState({
    loadingStatus: 'not loaded',
    error: null,
  });

export const channelMembers = createSlice({
  name: CHANNEL_MEMBERS_FEATURE_KEY,
  initialState: initialChannelMembersState,
  reducers: {
    add: channelMembersAdapter.addOne,
    remove: channelMembersAdapter.removeOne,
    onChannelPresence: (state: ChannelMembersState, action: PayloadAction<IChannelMember>) => {
      channelMembersAdapter.addOne(state, action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannelMembers.pending, (state: ChannelMembersState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchChannelMembers.fulfilled,
        (state: ChannelMembersState, action: PayloadAction<IChannelMember[]>) => {
          channelMembersAdapter.setAll(state, action.payload);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchChannelMembers.rejected, (state: ChannelMembersState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const channelMembersReducer = channelMembers.reducer;

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
 *   dispatch(channelMembersActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const channelMembersActions = { ...channelMembers.actions, fetchChannelMembers, fetchChannelMembersPresence };

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(fetchChannelMembers);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities, selectById } = channelMembersAdapter.getSelectors();

export const getChannelMembersState = (rootState: {
  [CHANNEL_MEMBERS_FEATURE_KEY]: ChannelMembersState;
}): ChannelMembersState => rootState[CHANNEL_MEMBERS_FEATURE_KEY];

export const selectAllChannelMembers = createSelector(getChannelMembersState, selectAll);

export const selectChannelMembesEntities = createSelector(
  getChannelMembersState,
  selectEntities
);


export const selectMembersByChannelId = (channelId?: string | null) => createSelector(
  selectChannelMembesEntities,
  (entities) => {
    const members = Object.values(entities);
    return members.filter((member) => member && member.user !== null);
  }
);

export const selectChannelMemberByUserIds = (channelId: string, userIds: string[]) => createSelector(
  selectChannelMembesEntities,
  (entities) => {
    const members = Object.values(entities);
    console.log('members', members, userIds, channelId)
    return members.filter((member) => member?.user?.id && userIds.includes(member?.user?.id))
  }
)

export const selectMemberById = (userId: string) => createSelector(
  getChannelMembersState,
  (state) => {
    return selectById(state, userId)
  }
);