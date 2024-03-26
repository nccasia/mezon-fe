import { ChannelMessage, ChannelStreamMode } from '@mezon/mezon-js';
import { IMessageWithUser, LIMIT_MESSAGE, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import memoize from 'memoizee';
import { MezonValueContext, ensureSession, ensureSocket, getMezonCtx, sleep } from '../helpers';
import { seenMessagePool } from './SeenMessagePool';

const FETCH_MESSAGES_CACHED_TIME = 1000 * 60 * 3;
export const MESSAGES_FEATURE_KEY = 'messages';

/*
 * Update these interfaces according to your requirements.
 */

export const mapMessageChannelToEntity = (channelMess: ChannelMessage, lastSeenId?: string): IMessageWithUser => {
	const creationTime = new Date(channelMess.create_time || '');
	const creationTimeMs = creationTime.getTime();
	return {
		...channelMess,
		creationTime,
		creationTimeMs,
		id: channelMess.id || '',
		date: new Date().toLocaleString(),
		user: {
			name: channelMess.username || '',
			username: channelMess.username || '',
			id: channelMess.sender_id || 'idUser',
			avatarSm: channelMess.avatar || '',
		},
		lastSeen: lastSeenId === channelMess.id,
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

export type FetchMessageParam = {
	lastLoadMessageId: string;
	hasMore?: boolean;
};
export type DataVoiceSocketOptinals = {
	clanId?: string;
	clanName?: string;
	id?: string;
	participant?: string;
	userId?: string;
	roomName?: string;
	lastScreenshot?: string;
};
export interface MessagesState extends EntityState<MessagesEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	isSending?: boolean;
	unreadMessagesEntries?: Record<string, string>;
	typingUsers?: Record<string, UserTypingState>;
	paramEntries: Record<string, FetchMessageParam>;
	reactionMessageData?: UpdateReactionMessageArgs;
	dataVoiceSocket?: DataVoiceSocketOptinals;
	dataVoiceSocketList?: DataVoiceSocketOptinals[];
}

export interface MessagesRootState {
	[MESSAGES_FEATURE_KEY]: MessagesState;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMessagesRootState(thunkAPI: GetThunkAPI<unknown>): MessagesRootState {
	return thunkAPI.getState() as MessagesRootState;
}

export const TYPING_TIMEOUT = 3000;

export const messagesAdapter = createEntityAdapter<MessagesEntity>();

export const fetchMessagesCached = memoize(
	(mezon: MezonValueContext, channelId: string, messageId?: string, direction?: number) =>
		mezon.client.listChannelMessages(mezon.session, channelId, messageId, direction, LIMIT_MESSAGE),
	{
		promise: true,
		maxAge: FETCH_MESSAGES_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[2] + args[3];
		},
	},
);

type fetchMessageChannelPayload = {
	channelId: string;
	noCache?: boolean;
	messageId?: string;
	direction?: number;
};

export const pushMemberToVoiceChannelData = createAsyncThunk(
	'voice/pushMemberToVoiceChannelData',
	async ({ clanId, clanName, id, participant, userId, roomName, lastScreenshot }: DataVoiceSocketOptinals, thunkAPI) => {
		try {
			await thunkAPI.dispatch(messagesActions.setDataSocketToStore({ clanId, clanName, id, participant, userId, roomName, lastScreenshot }));
			console.log('getData-OKE2', { clanId, clanName, id, participant, userId, roomName, lastScreenshot });
		} catch (e) {
			console.log(e);
			return thunkAPI.rejectWithValue([]);
		}
	},
);

export const fetchMessages = createAsyncThunk(
	'messages/fetchMessages',
	async ({ channelId, noCache, messageId, direction }: fetchMessageChannelPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		if (noCache) {
			fetchMessagesCached.clear(mezon, channelId, messageId, direction);
		}

		const response = await fetchMessagesCached(mezon, channelId, messageId, direction);
		if (!response.messages) {
			return thunkAPI.rejectWithValue([]);
		}

		const currentLastLoadMessageId = selectLastLoadMessageIDByChannelId(channelId)(getMessagesRootState(thunkAPI));
		const currentHasMore = selectHasMoreMessageByChannelId(channelId)(getMessagesRootState(thunkAPI));
		const messages = response.messages.map((item) => mapMessageChannelToEntity(item, response.last_seen_message_id));

		let hasMore = currentHasMore;
		if (currentLastLoadMessageId === messageId) {
			hasMore = !(Number(response.messages.length) < LIMIT_MESSAGE);
		}

		thunkAPI.dispatch(messagesActions.setMessageParams({ channelId, param: { lastLoadMessageId: messages[messages.length - 1].id, hasMore } }));

		if (response.last_seen_message_id) {
			thunkAPI.dispatch(
				messagesActions.setChannelLastMessage({
					channelId,
					messageId: response.last_seen_message_id,
				}),
			);
			const lastMessage = messages.find((message) => message.id === response.last_seen_message_id);

			if (lastMessage) {
				seenMessagePool.updateKnownSeenMessage({
					channelId: lastMessage.channel_id || '',
					channelLabel: lastMessage.channel_label,
					messageId: lastMessage.id,
					messageCreatedAt: lastMessage.creationTimeMs ? +lastMessage.creationTimeMs : 0,
					messageSeenAt: 0,
				});
			}
		}

		return messages;
	},
);

type LoadMoreMessArgs = {
	channelId: string;
};

export const loadMoreMessage = createAsyncThunk('messages/loadMoreMessage', async ({ channelId }: LoadMoreMessArgs, thunkAPI) => {
	try {
		const lastScrollMessageId = selectLastLoadMessageIDByChannelId(channelId)(getMessagesRootState(thunkAPI));
		await thunkAPI.dispatch(
			fetchMessages({
				channelId: channelId,
				noCache: false,
				messageId: lastScrollMessageId,
				direction: 3,
			}),
		);
	} catch (e) {
		console.log(e);
		return thunkAPI.rejectWithValue([]);
	}
});

type JumpToMessageArgs = {
	channelId: string;
	messageId: string;
};
export const jumpToMessage = createAsyncThunk('messages/jumpToMessage', async ({ messageId, channelId }: JumpToMessageArgs, thunkAPI) => {
	try {
		await thunkAPI.dispatch(
			fetchMessages({
				channelId: channelId,
				noCache: false,
				messageId: messageId,
				direction: 1,
			}),
		);
	} catch (e) {
		console.log(e);
		return thunkAPI.rejectWithValue([]);
	}
});

type UpdateMessageArgs = {
	channelId: string;
	channelLabel: string;
	messageId: string;
};

export const updateLastSeenMessage = createAsyncThunk(
	'messages/updateLastSeenMessage',
	async ({ channelId, channelLabel, messageId }: UpdateMessageArgs, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			// thunkAPI.dispatch(
			//   messagesActions.setChannelLastMessage({ channelId, messageId }),
			// );
			await mezon.socketRef.current?.writeLastSeenMessage(channelId, channelLabel, ChannelStreamMode.STREAM_MODE_CHANNEL, messageId);
		} catch (e) {
			console.log(e);
			return thunkAPI.rejectWithValue([]);
		}
	},
);

type UpdateTypingArgs = {
	channelId: string;
	userId: string;
	isTyping: boolean;
};

export const updateTypingUsers = createAsyncThunk(
	'messages/updateTypingUsers',
	async ({ channelId, userId, isTyping }: UpdateTypingArgs, thunkAPI) => {
		// set user typing to true
		thunkAPI.dispatch(messagesActions.setUserTyping({ channelId, userId, isTyping }));
		// after 30 seconds recalculate typing users
		await sleep(TYPING_TIMEOUT + 100);
		thunkAPI.dispatch(messagesActions.recheckTypingUsers());
	},
);

export type UpdateReactionMessageArgs = {
	id: string;
	channelId?: string;
	messageId?: string;
	emoji?: string;
	count?: number;
	userId?: string;
	action_delete?: boolean;
	actionRemove?: boolean;
};

export const updateReactionMessage = createAsyncThunk(
	'messages/updateReactionMessage',

	async ({ id, channelId, messageId, userId, emoji, count, actionRemove }: UpdateReactionMessageArgs, thunkAPI) => {
		try {
			await thunkAPI.dispatch(messagesActions.setReactionMessage({ id, channelId, messageId, userId, emoji, count, actionRemove }));
		} catch (e) {
			console.log(e);
			return thunkAPI.rejectWithValue([]);
		}
	},
);

export type SendMessageArgs = {
	channelId: string;
	channelLabel: string;
	mode: number;
};

export const sendTypingUser = createAsyncThunk('messages/sendTypingUser', async ({ channelId, channelLabel, mode }: SendMessageArgs, thunkAPI) => {
	const mezon = await ensureSocket(getMezonCtx(thunkAPI));
	const ack = mezon.socketRef.current?.writeMessageTyping(channelId, channelLabel, mode);
	return ack;
});

export type SetChannelLastMessageArgs = {
	channelId: string;
	messageId: string;
};

export type SetUserTypingArgs = {
	userId: string;
	channelId: string;
	isTyping: boolean;
};

export const initialMessagesState: MessagesState = messagesAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	isSending: false,
	unreadMessagesEntries: {},
	typingUsers: {},
	paramEntries: {},
	reactionMessageData: { id: '', channelId: '', messageId: '', userId: '', emoji: '', count: 0, actionRemove: false },
	dataVoiceSocket: {
		clanId: '',
		clanName: '',
		id: '',
		participant: '',
		userId: '',
		roomName: '',
		lastScreenshot: '',
	},
	dataVoiceSocketList:[]
});

export type SetCursorChannelArgs = {
	channelId: string;
	param: FetchMessageParam;
};

export const buildTypingUserKey = (channelId: string, userId: string) => `${channelId}__${userId}`;

export const messagesSlice = createSlice({
	name: MESSAGES_FEATURE_KEY,
	initialState: initialMessagesState,
	reducers: {
		setDataSocketToStore: (state, action: PayloadAction<DataVoiceSocketOptinals>) => {
			console.log('act', action);
			state.dataVoiceSocket = {
				clanId: action.payload?.clanId,
				clanName: action.payload?.clanName,
				id: action.payload?.id,
				participant: action.payload?.participant,
				userId: action.payload?.userId,
				roomName: action.payload?.roomName,
				lastScreenshot: action.payload?.lastScreenshot,
			};
			state.dataVoiceSocketList?.push(state.dataVoiceSocket)
			console.log(state.dataVoiceSocket);
		},
		setMessageParams: (state, action: PayloadAction<SetCursorChannelArgs>) => {
			state.paramEntries[action.payload.channelId] = action.payload.param;
		},
		newMessage: (state, action: PayloadAction<MessagesEntity>) => {
			messagesAdapter.addOne(state, action.payload);
			if (action.payload.channel_id) {
				// TODO: check duplicates with setChannelLastMessage
				state.unreadMessagesEntries = {
					...state.unreadMessagesEntries,
					[action.payload.channel_id]: action.payload.id,
				};
				const typingUserKey = buildTypingUserKey(action.payload.channel_id, action.payload.sender_id || '');

				if (state?.typingUsers && state?.typingUsers[typingUserKey]) {
					delete state.typingUsers[typingUserKey];
				}
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
				},
			};
		},

		setReactionMessage: (state, action: PayloadAction<UpdateReactionMessageArgs>) => {
			state.reactionMessageData = {
				id: action.payload.id,
				channelId: action.payload.channelId,
				messageId: action.payload.messageId,
				userId: action.payload.userId,
				emoji: action.payload.emoji,
				count: action.payload.count,
				actionRemove: action?.payload?.actionRemove,
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
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMessages.pending, (state: MessagesState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchMessages.fulfilled, (state: MessagesState, action: PayloadAction<MessagesEntity[]>) => {
				messagesAdapter.setMany(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchMessages.rejected, (state: MessagesState, action) => {
				state.loadingStatus = 'error';
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

export const messagesActions = {
	...messagesSlice.actions,
	fetchMessages,
	updateLastSeenMessage,
	updateTypingUsers,
	sendTypingUser,
	loadMoreMessage,
	updateReactionMessage,
	jumpToMessage,
	pushMemberToVoiceChannelData,
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
		return +b.creationTimeMs - +a.creationTimeMs;
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
		return messages.shift();
	});

export const selectLastMessageIdByChannelId = (channelId?: string | null) =>
	createSelector(selectLastMessageByChannelId(channelId), (message) => {
		return message && message.id;
	});

export const selectUnreadMessageEntries = createSelector(getMessagesState, (state) => state.unreadMessagesEntries);

export const selectUnreadMessageIdByChannelId = (channelId?: string | null) =>
	createSelector(getMessagesState, selectUnreadMessageEntries, (state, lastMessagesEntries) => {
		return lastMessagesEntries && lastMessagesEntries[channelId || ''];
	});

export const selectTypingUsers = createSelector(getMessagesState, (state) => state.typingUsers);

export const selectTypingUsersList = createSelector(selectTypingUsers, (typingUsers) => {
	return typingUsers && Object.values(typingUsers);
});

export const selectTypingUserIds = createSelector(selectTypingUsersList, (typingUsers) => {
	return typingUsers && typingUsers.map((u) => u.userId);
});

export const selectTypingUserIdsByChannelId = (channelId: string) =>
	createSelector(selectTypingUsersList, (typingUsers) => {
		return typingUsers && typingUsers.filter((user) => user.channelId === channelId).map((u) => u.userId);
	});

export const selectTypingUsersListByChannelId = (channelId: string) =>
	createSelector(selectTypingUsersList, (typingUsers) => {
		return typingUsers && typingUsers.filter((user) => user.channelId === channelId);
	});

export const selectTypingUserById = (userId: string) =>
	createSelector(selectTypingUsers, (typingUsers) => {
		return typingUsers && typingUsers[userId];
	});

export const selectMessageParams = createSelector(getMessagesState, (state) => state.paramEntries);
export const selectParamByChannelId = (channelId: string) =>
	createSelector(selectMessageParams, (param) => {
		return param && param[channelId];
	});

export const selectHasMoreMessageByChannelId = (channelId: string) =>
	createSelector(selectMessageParams, (param) => {
		return (param && param[channelId] && param[channelId].hasMore) || false;
	});

export const selectLastLoadMessageIDByChannelId = (channelId: string) =>
	createSelector(selectMessageParams, (param) => {
		return param && param[channelId] && param[channelId].lastLoadMessageId;
	});
export const selectMessageReacted = createSelector(getMessagesState, (state) => state.reactionMessageData);

export const selectMessageByMessageId = (messageId: string) =>
	createSelector(selectMessagesEntities, (messageEntities) => messageEntities[messageId]);

export const selectNewestUserJoinedVoice = createSelector(getMessagesState, (state) => state.dataVoiceSocketList);
