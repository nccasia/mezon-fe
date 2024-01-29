import { ICategory, IChannel, LoadingStatus } from '@mezon/utils';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  ensureChannel,
  ensureClient,
  ensureSession,
  getMezonCtx,
} from '../helpers';
import {
  ApiChannelDescription,
  ApiCreateChannelDescRequest,
} from '@mezon/mezon-js/dist/api.gen';
import { messagesActions } from '../messages/messages.slice';
import { channelMembersActions } from '../channelmembers/channel.members';
import { useNavigate } from 'react-router-dom';

export const CHANNELS_FEATURE_KEY = 'channels';

/*
 * Update these interfaces according to your requirements.
 */
export interface ChannelsEntity extends IChannel {
  id: string; // Primary ID
}

export const mapChannelToEntity = (channelRes: ApiChannelDescription) => {
  return { ...channelRes, id: channelRes.channel_id || '' };
};

export interface ChannelsState extends EntityState<ChannelsEntity, string> {
  loadingStatus: LoadingStatus;
  socketStatus: LoadingStatus;
  error?: string | null;
  currentChannelId?: string | null;
  isOpenCreateNewChannel?: boolean;
  currentCategory: ICategory | null;
  newChannelCreated: ApiCreateChannelDescRequest | null | undefined;
}

export const channelsAdapter = createEntityAdapter<ChannelsEntity>();

type fetchChannelsPayload = {
  clanId: string;
};

function waitUntil<T>(
  condition: () => T | undefined,
  ms: number = 100,
): Promise<T> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const result = condition();
      if (result !== undefined) {
        clearInterval(interval);
        resolve(result);
      }
    }, ms);
  });
}

export const joinChanel = createAsyncThunk(
  'channels/joinChanel',
  async (channelId: string, thunkAPI) => {
    try {
      thunkAPI.dispatch(channelsActions.setCurrentChannelId(channelId));
      thunkAPI.dispatch(messagesActions.fetchMessages({ channelId }));
      thunkAPI.dispatch(
        channelMembersActions.fetchChannelMembers({ channelId }),
      );

      const chanel = await waitUntil(() =>
        selectChannelById(channelId)(
          thunkAPI.getState() as { [CHANNELS_FEATURE_KEY]: ChannelsState },
        ),
      );
      if (!chanel || !chanel.channel_lable) {
        return thunkAPI.rejectWithValue([]);
      }

      const mezon = await ensureSession(getMezonCtx(thunkAPI));
      mezon.joinChatChannel(channelId, chanel?.channel_lable || '');
      return chanel;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue([]);
    }
  },
);

export const createNewChannel = createAsyncThunk(
  'channels/createNewChannel',
  async (body: ApiCreateChannelDescRequest, thunkAPI) => {
    try {
      const navigate = useNavigate();
      const mezon = await ensureSession(getMezonCtx(thunkAPI));
      const response = await mezon.client.createChannelDesc(
        mezon.session,
        body,
      );
      // thunkAPI.dispatch(fetchChannels({ clanId: body.clan_id as string }));
      if (response) {
        thunkAPI.dispatch(fetchChannels({ clanId: body.clan_id as string }));
      } else {
        return thunkAPI.rejectWithValue([]);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue([]);
    }
  },
);

export const fetchChannels = createAsyncThunk(
  'channels/fetchStatus',
  async ({ clanId }: fetchChannelsPayload, thunkAPI) => {
    const mezon = ensureClient(getMezonCtx(thunkAPI));
    const response = await mezon.client.listChannelDescs(
      mezon.session,
      100,
      1,
      '',
      clanId,
    );

    if (!response.channeldesc) {
      return thunkAPI.rejectWithValue([]);
    }

    const channels = response.channeldesc.map(mapChannelToEntity);

    if (channels.length > 0) {
      const currentChannelId = selectCurrentChannelId(
        thunkAPI.getState() as unknown as {
          [CHANNELS_FEATURE_KEY]: ChannelsState;
        },
      );
      if (!currentChannelId) {
        thunkAPI.dispatch(channelsActions.joinChanel(channels[0].id));
      }
    }
    return channels;
  },
);

export const initialChannelsState: ChannelsState =
  channelsAdapter.getInitialState({
    loadingStatus: 'not loaded',
    socketStatus: 'not loaded',
    error: null,
    isOpenCreateNewChannel: false,
    currentCategory: null,
    newChannelCreated: null,
  });

export const channelsSlice = createSlice({
  name: CHANNELS_FEATURE_KEY,
  initialState: initialChannelsState,
  reducers: {
    add: channelsAdapter.addOne,
    remove: channelsAdapter.removeOne,
    setCurrentChannelId: (state, action: PayloadAction<string>) => {
      state.currentChannelId = action.payload;
    },
    openCreateNewModalChannel: (state, action: PayloadAction<boolean>) => {
      state.isOpenCreateNewChannel = action.payload;
    },
    getCurrentCategory: (state, action: PayloadAction<ICategory>) => {
      state.currentCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state: ChannelsState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchChannels.fulfilled,
        (state: ChannelsState, action: PayloadAction<ChannelsEntity[]>) => {
          channelsAdapter.setAll(state, action.payload);
          state.loadingStatus = 'loaded';
        },
      )
      .addCase(fetchChannels.rejected, (state: ChannelsState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });

    builder
      .addCase(joinChanel.rejected, (state: ChannelsState, action) => {
        state.socketStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(joinChanel.pending, (state: ChannelsState) => {
        state.socketStatus = 'loading';
      })
      .addCase(joinChanel.fulfilled, (state: ChannelsState) => {
        state.socketStatus = 'loaded';
      });
    builder
      .addCase(createNewChannel.pending, (state: ChannelsState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        createNewChannel.fulfilled,
        (
          state: ChannelsState,
          // action: PayloadAction<ApiCreateChannelDescRequest | undefined | null>,
        ) => {
          state.loadingStatus = 'loaded';
          state.isOpenCreateNewChannel = false;
          // setTimeout(() => {
          //   state.newChannelCreated = action.payload;
          // }, 1000);

        },
      )
      .addCase(createNewChannel.rejected, (state: ChannelsState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const channelsReducer = channelsSlice.reducer;

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
 *   dispatch(channelsActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const { openCreateNewModalChannel } = channelsSlice.actions;

export const channelsActions = {
  ...channelsSlice.actions,
  fetchChannels,
  joinChanel,
  createNewChannel,
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
 * const entities = useSelector(selectAllChannels);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = channelsAdapter.getSelectors();

export const getChannelsState = (rootState: {
  [CHANNELS_FEATURE_KEY]: ChannelsState;
}): ChannelsState => rootState[CHANNELS_FEATURE_KEY];

export const selectAllChannels = createSelector(getChannelsState, selectAll);

export const selectChannelsEntities = createSelector(
  getChannelsState,
  selectEntities,
);

export const selectChannelById = (id: string) =>
  createSelector(selectChannelsEntities, (clansEntities) => clansEntities[id]);

export const selectCurrentChannelId = createSelector(
  getChannelsState,
  (state) => state.currentChannelId,
);

export const selectCurrentChannel = createSelector(
  selectChannelsEntities,
  selectCurrentChannelId,
  (clansEntities, clanId) => (clanId ? clansEntities[clanId] : null),
);
