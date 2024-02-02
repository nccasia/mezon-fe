import { IMessageWithUser, LoadingStatus } from "@mezon/utils";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ensureSession, ensureSocket, getMezonCtx, sleep } from "../helpers";
import { ChannelMessage } from "@mezon/mezon-js/dist";
import { seenMessagePool } from "./SeenMessagePool";
import { GetThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";

export const MESSAGES_FEATURE_KEY = "messages";

/*
 * Update these interfaces according to your requirements.
 */

export const mapMessageChannelToEntity = (
  channelMess: ChannelMessage,
  lastSeenId?: string,
): IMessageWithUser => {
  const creationTime = new Date(channelMess.create_time || "");
  const creationTimeMs = creationTime.getTime();
  return {
    ...channelMess,
    creationTime,
    creationTimeMs,
    id: channelMess.message_id || "",
    body: { text: "Hello world" },
    user: null,
    lastSeen: lastSeenId === channelMess.message_id,
  };
};

export interface MessagesEntity extends IMessageWithUser {
  id: string; // Primary ID
}

export type UserTypingState = {
  userId: string;
  channelId: string;
  isTyping: boolean;
  timeAt: number;
};

export interface MessagesState extends EntityState<MessagesEntity, string> {
  loadingStatus: LoadingStatus;
  error?: string | null;
  isSending?: boolean;
  unreadMessagesEntries?: Record<string, string>;
  typingUsers?: Record<string, UserTypingState>;
}

export interface MessagesRootState {
  [MESSAGES_FEATURE_KEY]: MessagesState;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMessagesRootState(
  thunkAPI: GetThunkAPI<unknown>,
): MessagesRootState {
  return thunkAPI.getState() as MessagesRootState;
}

const TYPING_TIMEOUT = 10000;

export const messagesAdapter = createEntityAdapter<MessagesEntity>();

type fetchMessageChannelPayload = {
  channelId: string;
};

export const fetchMessages = createAsyncThunk("messages/fetchMessages", async ({ channelId }: fetchMessageChannelPayload, thunkAPI) => {
  const mezon = await ensureSession(getMezonCtx(thunkAPI));
  const response = await mezon.client.listChannelMessages(mezon.session, channelId, 100, false);
  if (!response.messages) {
    return thunkAPI.rejectWithValue([]);
  }

  const messages = response.messages.map((item) => mapMessageChannelToEntity(item, response.last_seen_message_id));

  if (response.last_seen_message_id) {
    thunkAPI.dispatch(
      messagesActions.setChannelLastMessage({
        channelId,
        messageId: response.last_seen_message_id,
      }),
    );
    const lastMessage = messages.find(
      (message) => message.id === response.last_seen_message_id,
    );

    if (lastMessage) {
      seenMessagePool.updateKnownSeenMessage({
        channelId: lastMessage.channel_id || "",
        messageId: lastMessage.id,
        messageCreatedAt: lastMessage.creationTimeMs
          ? +lastMessage.creationTimeMs
          : 0,
        messageSeenAt: 0,
      });
    }
  }

  return messages;
});

type UpdateMessageArgs = {
  channelId: string;
  messageId: string;
};

export const updateLastSeenMessage = createAsyncThunk("messages/updateLastSeenMessage", async ({ channelId, messageId }: UpdateMessageArgs, thunkAPI) => {
  try {
    const mezon = await ensureSocket(getMezonCtx(thunkAPI));
    // thunkAPI.dispatch(
    //   messagesActions.setChannelLastMessage({ channelId, messageId }),
    // );
    await mezon.socketRef.current?.writeLastSeenMessage(channelId, messageId);
  } catch (e) {
    console.log(e);
    return thunkAPI.rejectWithValue([]);
  }
});

type UpdateTypingArgs = {
  channelId: string;
  userId: string;
  isTyping: boolean;
}

export const updateTypingUsers = createAsyncThunk(
  "messages/updateTypingUsers",
  async ({ channelId, userId, isTyping }: UpdateTypingArgs, thunkAPI) => {
    // set user typing to true
    thunkAPI.dispatch(messagesActions.setUserTyping({ channelId, userId, isTyping }));
    // after 30 seconds recalculate typing users
    await sleep(30500);
    thunkAPI.dispatch(messagesActions.recheckTypingUsers());
  },
);

export type SendMessageArgs = {
  channelId: string;
}

export const sendTypingUser = createAsyncThunk(
  "messages/sendTypingUser",
  async ({ channelId }: SendMessageArgs, thunkAPI) => {
    const mezon = await ensureSocket(getMezonCtx(thunkAPI));
    const ack = mezon.socketRef.current?.writeMessageTyping(channelId);
    return ack;
  },
);

export type SetChannelLastMessageArgs = {
  channelId: string;
  messageId: string;
};

export type SetUserTypingArgs = {
  userId: string;
  channelId: string;
  isTyping: boolean;
};

export const initialMessagesState: MessagesState =
  messagesAdapter.getInitialState({
    loadingStatus: "not loaded",
    error: null,
    isSending: false,
    unreadMessagesEntries: {},
    typingUsers: {},
  });

export const buildTypingUserKey = (channelId: string, userId: string) => `${channelId}__${userId}`;

export const messagesSlice = createSlice({
  name: MESSAGES_FEATURE_KEY,
  initialState: initialMessagesState,
  reducers: {
    newMessage: (state, action: PayloadAction<MessagesEntity>) => {
      messagesAdapter.addOne(state, action.payload);
      if (action.payload.channel_id) {
        // TODO: check duplicates with setChannelLastMessage
        state.unreadMessagesEntries = {
          ...state.unreadMessagesEntries,
          [action.payload.channel_id]: action.payload.id,
        };
      }
    },
    markMessageAsLastSeen: (state, action: PayloadAction<string>) => {
      messagesAdapter.updateOne(state, {
        id: action.payload,
        changes: {
          lastSeen: true,
        },
      });
    },
    remove: messagesAdapter.removeOne,
    checkMessageSendingAction: (state) => {
      state.isSending = !state.isSending;
    },
    setChannelLastMessage: (state, action: PayloadAction<SetChannelLastMessageArgs>) => {
      state.unreadMessagesEntries = {
        ...state.unreadMessagesEntries,
        [action.payload.channelId]: action.payload.messageId,
      };
    },
    setUserTyping: (state, action: PayloadAction<SetUserTypingArgs>) => {
      state.typingUsers = {
        ...state.typingUsers,
        [buildTypingUserKey(action.payload.channelId, action.payload.userId)]: {
          channelId: action.payload.channelId,
          isTyping: action.payload.isTyping,
          timeAt: Date.now(),
          userId: action.payload.userId,
        }
      };
    },
    recheckTypingUsers: (state) => {
      const now = Date.now();
      const typingUsers = { ...state.typingUsers };
      for (const key in typingUsers) {
        if (now - typingUsers[key].timeAt > TYPING_TIMEOUT) {
          delete typingUsers[key];
        }
      }
      state.typingUsers = typingUsers;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state: MessagesState) => {
        state.loadingStatus = "loading";
      })
      .addCase(
        fetchMessages.fulfilled,
        (state: MessagesState, action: PayloadAction<MessagesEntity[]>) => {
          messagesAdapter.setAll(state, action.payload);
          state.loadingStatus = "loaded";
        },
      )
      .addCase(fetchMessages.rejected, (state: MessagesState, action) => {
        state.loadingStatus = "error";
        state.error = action.error.message;
      });

    builder.addCase(updateLastSeenMessage.fulfilled, (state: MessagesState) => {
      // state.loadingStatus = 'loaded';
    });
  },
});

/*
 * Export reducer for store configuration.
 */
export const messagesReducer = messagesSlice.reducer;

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
 *   dispatch(messagesActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const { checkMessageSendingAction } = messagesSlice.actions;

export const messagesActions = {
  ...messagesSlice.actions,
  fetchMessages,
  checkMessageSendingAction,
  updateLastSeenMessage,
  updateTypingUsers,
  sendTypingUser,
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
 * const entities = useSelector(selectAllMessages);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = messagesAdapter.getSelectors();

export const getMessagesState = (rootState: { [MESSAGES_FEATURE_KEY]: MessagesState }): MessagesState => rootState[MESSAGES_FEATURE_KEY];

export const selectAllMessages = createSelector(getMessagesState, selectAll);

export function orderMessageByDate(a: MessagesEntity, b: MessagesEntity) {
  if (a.creationTimeMs && b.creationTimeMs) {
    return +a.creationTimeMs - +b.creationTimeMs;
  }
  return 0;
}

export const selectMessagesEntities = createSelector(getMessagesState, selectEntities);

export const selectMessageByChannelId = (channelId?: string | null) =>
  createSelector(selectMessagesEntities, (entities) => {
    const messages = Object.values(entities);
    return messages.sort(orderMessageByDate).filter((message) => message && message.channel_id === channelId);
  });

export const selectLastMessageByChannelId = (channelId?: string | null) =>
  createSelector(selectMessageByChannelId(channelId), (messages) => {
    return messages.pop();
  });

export const selectLastMessageIdByChannelId = (channelId?: string | null) =>
  createSelector(selectLastMessageByChannelId(channelId), (message) => {
    return message && message.id;
  });

export const selectUnreadMessageEntries = createSelector(getMessagesState, (state) => state.unreadMessagesEntries);

export const selectUnreadMessageIdByChannelId = (channelId?: string | null) =>
  createSelector(
    getMessagesState,
    selectUnreadMessageEntries,
    (state, lastMessagesEntries) => {
      return lastMessagesEntries && lastMessagesEntries[channelId || ""];
    },
  );

export const selectTypingUsers = createSelector(
  getMessagesState,
  (state) => state.typingUsers,
);

export const selectTypingUsersList = createSelector(
  selectTypingUsers,
  (typingUsers) => {
    return typingUsers && Object.values(typingUsers);
  },
);

export const selectTypingUserIds = createSelector(selectTypingUsersList, (typingUsers) => {
  return typingUsers && typingUsers.map((u) => u.userId);
});

export const selectTypingUsersListByChannelId = (channelId: string) =>
  createSelector(selectTypingUsersList, (typingUsers) => {
    return typingUsers && typingUsers.filter((user) => user.channelId === channelId);
  });

export const selectTypingUserById = (userId: string) =>
  createSelector(selectTypingUsers, (typingUsers) => {
    return typingUsers && typingUsers[userId];
  });
