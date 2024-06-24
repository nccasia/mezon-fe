import {
	EmojiDataOptionals,
	IMessageSendPayload,
	IMessageWithUser,
	LIMIT_MESSAGE,
	LoadingStatus,
	checkContinuousMessagesByCreateTimeMs,
	checkSameDayByCreateTime,
} from '@mezon/utils';
import {
	EntityState,
	PayloadAction,
	createAsyncThunk,
	createEntityAdapter,
	createSelector,
	createSelectorCreator,
	createSlice,
	weakMapMemoize,
} from '@reduxjs/toolkit';
import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import memoize from 'memoizee';
import { ChannelMessage, ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { channelsActions } from '../channels/channels.slice';
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
	channel_id: string;
	isStartedMessageGroup?: boolean;
	isStartedMessageOfTheDay?: boolean;
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

export interface MessagesState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	isSending?: boolean;
	unreadMessagesEntries?: Record<string, string>;
	typingUsers?: Record<string, UserTypingState>;
	paramEntries: Record<string, FetchMessageParam>;
	openOptionMessageState: boolean;
	quantitiesMessageRemain: number;
	dataReactionGetFromLoadMessage: EmojiDataOptionals[];
	channelMessages: Record<
		string,
		EntityState<MessagesEntity, string> & {
			id: string;
		}
	>;
}

export type FetchMessagesMeta = {
	arg: {
		channelId: string;
	};
};

export interface MessagesRootState {
	[MESSAGES_FEATURE_KEY]: MessagesState;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMessagesRootState(thunkAPI: GetThunkAPI<unknown>): MessagesRootState {
	return thunkAPI.getState() as MessagesRootState;
}

export const TYPING_TIMEOUT = 3000;

export const fetchMessagesCached = memoize(
	(mezon: MezonValueContext, channelId: string, messageId?: string, direction?: number) =>
		mezon.client.listChannelMessages(mezon.session, channelId, messageId, direction, LIMIT_MESSAGE),
	{
		promise: true,
		maxAge: FETCH_MESSAGES_CACHED_TIME,
		normalizer: (args) => {
			// set default value
			if (args[2] === undefined) {
				args[2] = '';
			}
			if (args[3] === undefined) {
				args[3] = 1;
			}
			return args[1] + args[2] + args[3] + args[0].session.username;
		},
	},
);

type fetchMessageChannelPayload = {
	channelId: string;
	noCache?: boolean;
	messageId?: string;
	direction?: number;
};

export const fetchMessages = createAsyncThunk(
	'messages/fetchMessages',
	async ({ channelId, noCache, messageId, direction }: fetchMessageChannelPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		if (noCache) {
			fetchMessagesCached.clear(mezon, channelId, messageId, direction);
		}

		const response = await fetchMessagesCached(mezon, channelId, messageId, direction);
		if (!response.messages) {
			return [];
		}

		//const currentHasMore = selectHasMoreMessageByChannelId(channelId)(getMessagesRootState(thunkAPI));
		const messages = response.messages.map((item) => mapMessageChannelToEntity(item, response.last_seen_message?.id));
		thunkAPI.dispatch(messagesActions.setQuatitiesMessageRemain(messages.length));

		const hasMore = Number(response.messages.length) >= LIMIT_MESSAGE;
		if (messages.length > 0) {
			thunkAPI.dispatch(
				messagesActions.setMessageParams({ channelId, param: { lastLoadMessageId: messages[messages.length - 1].id, hasMore } }),
			);
		}

		if (response.last_seen_message?.id) {
			thunkAPI.dispatch(
				messagesActions.setChannelLastMessage({
					channelId,
					messageId: response.last_seen_message?.id,
				}),
			);
			const lastMessage = messages.find((message) => message.id === response.last_seen_message?.id);

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
		return await thunkAPI.dispatch(
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
	messageId: string;
};

export const updateLastSeenMessage = createAsyncThunk(
	'messages/updateLastSeenMessage',
	async ({ channelId, messageId }: UpdateMessageArgs, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const now = Math.floor(Date.now() / 1000);
			await mezon.socketRef.current?.writeLastSeenMessage(channelId, ChannelStreamMode.STREAM_MODE_CHANNEL, messageId, now.toString());
		} catch (e) {
			return thunkAPI.rejectWithValue('Error updating last seen message');
		}
	},
	{
		condition: ({ channelId, messageId }, { getState }) => {
			const state = getState() as MessagesRootState;
			const message = selectMessageEntityById(state, channelId, messageId);
			if (!message) {
				return false;
			}
			if (message.isSending) {
				return false;
			}
			return true;
		},
	},
);

type SendMessagePayload = {
	clanId: string;
	channelId: string;
	content: IMessageSendPayload;
	mentions?: Array<ApiMessageMention>;
	attachments?: Array<ApiMessageAttachment>;
	references?: Array<ApiMessageRef>;
	anonymous?: boolean;
	mentionEveryone?: boolean;
	mode: number;
	senderId: string;
};

export const sendMessage = createAsyncThunk('messages/sendMessage', async (payload: SendMessagePayload, thunkAPI) => {
	const { content, mentions, attachments, references, anonymous, mentionEveryone, channelId, mode, clanId, senderId } = payload;
	const id = Date.now().toString();

	async function doSend() {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));

		const session = mezon.sessionRef.current;
		const client = mezon.clientRef.current;
		const socket = mezon.socketRef.current;
		// const channel = mezon.channelRef.current;

		if (!client || !session || !socket || !channelId) {
			throw new Error('Client is not initialized');
		}

		const res = await socket.writeChatMessage(clanId, channelId, mode, content, mentions, attachments, references, anonymous, mentionEveryone);

		return res;
	}

	async function sendWithRetry(retryCount: number): ReturnType<typeof doSend> {
		try {
			const res = await doSend();
			return res;
		} catch (error) {
			if (retryCount > 0) {
				const r = await sendWithRetry(retryCount - 1);
				return r;
			} else {
				throw error;
			}
		}
	}

	async function fakeItUntilYouMakeIt() {
		const fakeMessage: ChannelMessage = {
			id,
			code: 0, // Add new message
			channel_id: channelId,
			// @ts-ignore
			content: content,
			create_time: new Date().toISOString(),
			sender_id: senderId,
			username: '',
			avatar: '',
			isSending: true,
			references: [],
		};
		const fakeMess = mapMessageChannelToEntity(fakeMessage);

		// need to discuss later
		// thunkAPI.dispatch(messagesActions.newMessage(fakeMess));

		const res = await sendWithRetry(1);

		const timestamp = Date.now() / 1000;
		thunkAPI.dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId, timestamp }));

		const mess = { ...fakeMess, id: res.message_id, create_time: res.create_time };

		thunkAPI.dispatch(messagesActions.markAsSent({ id, mess }));
	}

	try {
		await fakeItUntilYouMakeIt();
	} catch (error) {
		console.error('Error sending message', error);
		thunkAPI.dispatch(messagesActions.markAsError({ messageId: id, channelId }));
		return thunkAPI.rejectWithValue('Error sending message');
	}
});

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

export type SendMessageArgs = {
	channelId: string;
	mode: number;
};

export const sendTypingUser = createAsyncThunk('messages/sendTypingUser', async ({ channelId, mode }: SendMessageArgs, thunkAPI) => {
	const mezon = await ensureSocket(getMezonCtx(thunkAPI));
	const ack = mezon.socketRef.current?.writeMessageTyping(channelId, mode);
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

const channelMessagesAdapter = createEntityAdapter<MessagesEntity>({
	sortComparer: orderMessageByTimeMsAscending,
});

export const initialMessagesState: MessagesState = {
	loadingStatus: 'not loaded',
	error: null,
	isSending: false,
	unreadMessagesEntries: {},
	typingUsers: {},
	paramEntries: {},
	openOptionMessageState: false,
	quantitiesMessageRemain: 0,
	dataReactionGetFromLoadMessage: [],
	channelMessages: {},
};

export type SetCursorChannelArgs = {
	channelId: string;
	param: FetchMessageParam;
};
export type MarkAsSentArgs = {
	id: string;
	mess: IMessageWithUser;
};

export const buildTypingUserKey = (channelId: string, userId: string) => `${channelId}__${userId}`;

export const messagesSlice = createSlice({
	name: MESSAGES_FEATURE_KEY,
	initialState: initialMessagesState,
	reducers: {
		setMessageParams: (state, action: PayloadAction<SetCursorChannelArgs>) => {
			state.paramEntries[action.payload.channelId] = action.payload.param;
		},
		setQuatitiesMessageRemain: (state, action) => {
			state.quantitiesMessageRemain = action.payload;
		},
		newMessage: (state, action: PayloadAction<MessagesEntity>) => {
			const { code, channel_id: channelId, id: messageId } = action.payload;
			if (!channelId || !messageId) return state;
			if (!state.channelMessages[channelId]) {
				state.channelMessages[channelId] = channelMessagesAdapter.getInitialState({
					id: channelId,
				});
			}
			const channelEntity = state.channelMessages[channelId];
			switch (code) {
				case 0: {
					const existingMessage = channelEntity?.entities?.[messageId];
					if (existingMessage) {
						channelMessagesAdapter.updateOne(channelEntity, {
							id: messageId,
							changes: action.payload,
						});
					} else {
						handleAddOneMessage({ state, channelId, adapterPayload: action.payload });
					}
					break;
				}
				case 1: {
					channelMessagesAdapter.updateOne(channelEntity, {
						id: action.payload.id,
						changes: {
							content: action.payload.content,
							update_time: action.payload.update_time,
						},
					});
					break;
				}
				case 2: {
					handleRemoveOneMessage({ state, channelId, messageId });
					break;
				}
				default:
					break;
			}

			// TODO: check duplicates with setChannelLastMessage
			state.unreadMessagesEntries = {
				...state.unreadMessagesEntries,
				[action.payload.channel_id]: action.payload.id,
			};
			const typingUserKey = buildTypingUserKey(action.payload.channel_id, action.payload.sender_id || '');

			if (state?.typingUsers?.[typingUserKey]) {
				delete state.typingUsers[typingUserKey];
			}
		},

		markAsSent: (state, action: PayloadAction<MarkAsSentArgs>) => {
			const { mess, id } = action.payload;
			const channelId = mess.channel_id;
			const channelEntity = state.channelMessages?.[channelId];
			if (!channelEntity) {
				state.channelMessages[channelId] = channelMessagesAdapter.getInitialState({
					id: channelId,
				});
			}

			// Remove the message with the old id
			const updatedState = handleRemoveOneMessage({ state, channelId, messageId: id });
			if (updatedState) state.channelMessages[channelId] = updatedState;

			// Add the new message if it doesn't exist
			// if (!channelEntity.entities?.[mess.id]) {
			// 	handleAddOneMessage({ state, channelId, adapterPayload: mess });
			// }
		},
		markAsError: (
			state,
			action: PayloadAction<{
				messageId: string;
				channelId: string;
			}>,
		) => {
			const channelId = action.payload.channelId;
			if (!state.channelMessages?.[channelId]) {
				state.channelMessages[channelId] = channelMessagesAdapter.getInitialState({
					id: channelId,
				});
			}
			channelMessagesAdapter.updateOne(state.channelMessages[channelId], {
				id: action.payload.messageId,
				changes: {
					isError: true,
				},
			});
		},
		remove: (
			state,
			action: PayloadAction<{
				channelId: string;
				messageId: string;
			}>,
		) => {
			const { channelId, messageId } = action.payload;
			handleRemoveOneMessage({ state, channelId, messageId });
		},
		removeAll: () => initialMessagesState,
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
		setOpenOptionMessageState(state, action) {
			state.openOptionMessageState = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMessages.pending, (state: MessagesState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchMessages.fulfilled, (state: MessagesState, action: PayloadAction<MessagesEntity[], string, FetchMessagesMeta>) => {
				const channelId = action?.meta?.arg?.channelId;

				state.loadingStatus = 'loaded';

				const isNew = channelId && action.payload.some(({ id }) => !state.channelMessages?.[channelId]?.entities?.[id]);
				if (!isNew || !channelId) return state;
				const reversedMessages = action.payload.reverse();

				handleSetManyMessages({
					state,
					channelId,
					adapterPayload: reversedMessages,
				});
			})
			.addCase(fetchMessages.rejected, (state: MessagesState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
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
	sendMessage,
	fetchMessages,
	updateLastSeenMessage,
	updateTypingUsers,
	sendTypingUser,
	loadMoreMessage,
	jumpToMessage,
};

export const getMessagesState = (rootState: { [MESSAGES_FEATURE_KEY]: MessagesState }): MessagesState => rootState[MESSAGES_FEATURE_KEY];

export const selectAllMessages = createSelector(getMessagesState, (messageState) => {
	const res: MessagesEntity[] = [];
	Object.values(messageState.channelMessages || {}).forEach((item) => {
		res.concat(Object.values(item?.entities || {}));
	});
	return res;
});

export function orderMessageByDate(a: MessagesEntity, b: MessagesEntity) {
	if (a.creationTimeMs && b.creationTimeMs) {
		return +b.creationTimeMs - +a.creationTimeMs;
	}
	return 0;
}

export function orderMessageByTimeMsAscending(a: MessagesEntity, b: MessagesEntity) {
	if (a.creationTimeMs && b.creationTimeMs) {
		return +a.creationTimeMs - +b.creationTimeMs;
	}
	return 0;
}

export const selectMessagesEntities = createSelector(getMessagesState, (messageState) => {
	let res: Record<string, MessagesEntity> = {};
	Object.values(messageState.channelMessages || {}).forEach((item) => {
		res = { ...res, ...item.entities };
	});

	return res;
});

export const selectOpenOptionMessageState = createSelector(getMessagesState, (state: MessagesState) => state.openOptionMessageState);

export const selectMessageByChannelId = (channelId?: string | null) =>
	createSelector(getMessagesState, (messagesState) => {
		const messages = channelId && messagesState.channelMessages[channelId] ? Object.values(messagesState.channelMessages[channelId]) : [];
		return messages.slice().sort(orderMessageByDate);
	});

export const selectMessageByUserId = (channelId?: string | null, senderId?: string | null) =>
	createSelector(selectMessageByChannelId(channelId), (messages) => {
		return messages.filter((message) => message.sender_id === senderId);
	});

export const selectLastMessageByChannelId = (channelId?: string | null) =>
	createSelector(selectMessageByChannelId(channelId), (messages) => {
		return messages.shift();
	});

export const selectUnreadMessageEntries = createSelector(getMessagesState, (state) => state.unreadMessagesEntries);

export const selectUnreadMessageIdByChannelId = (channelId?: string | null) =>
	createSelector(getMessagesState, selectUnreadMessageEntries, (state, lastMessagesEntries) => {
		return lastMessagesEntries?.[channelId ?? ''];
	});

export const selectTypingUsers = createSelector(getMessagesState, (state) => state.typingUsers);

export const selectTypingUsersList = createSelector(selectTypingUsers, (typingUsers) => {
	return typingUsers && Object.values(typingUsers);
});

export const selectTypingUserIds = createSelector(selectTypingUsersList, (typingUsers) => {
	return typingUsers?.map((u) => u.userId);
});

export const selectTypingUserIdsByChannelId = (channelId: string) =>
	createSelector(selectTypingUsersList, (typingUsers) => {
		return typingUsers?.filter((user) => user.channelId === channelId).map((u) => u.userId);
	});

export const selectTypingUsersListByChannelId = (channelId: string) =>
	createSelector(selectTypingUsersList, (typingUsers) => {
		return typingUsers?.filter((user) => user.channelId === channelId);
	});

export const selectTypingUserById = (userId: string) =>
	createSelector(selectTypingUsers, (typingUsers) => {
		return typingUsers?.[userId];
	});

export const selectMessageParams = createSelector(getMessagesState, (state) => state.paramEntries);
export const selectParamByChannelId = (channelId: string) =>
	createSelector(selectMessageParams, (param) => {
		return param?.[channelId];
	});

export const selectHasMoreMessageByChannelId = (channelId: string) =>
	createSelector(selectMessageParams, (param) => {
		return param?.[channelId]?.hasMore ?? true;
	});

export const selectLastLoadMessageIDByChannelId = (channelId: string) =>
	createSelector(selectMessageParams, (param) => {
		return param[channelId]?.lastLoadMessageId;
	});

export const selectMessageByMessageId = (messageId: string) =>
	createSelector(selectMessagesEntities, (messageEntities) => {
		return messageEntities[messageId];
	});

export const selectQuantitiesMessageRemain = createSelector(getMessagesState, (state) => state.quantitiesMessageRemain);

// V2

const createCachedSelector = createSelectorCreator({
	memoize: weakMapMemoize,
	argsMemoize: weakMapMemoize,
});

export const selectMessageIdsByChannelId = createCachedSelector(
	(state, channelId: string) => {
		const messagesState = getMessagesState(state);
		return messagesState.channelMessages[channelId]?.ids || null;
	},
	(messagesState: string[] | null) => {
		return messagesState || [];
	},
);

export const selectMessageEntityById = createCachedSelector(
	(state, channelId, messageId) => {
		const messagesState = getMessagesState(state);
		return messagesState.channelMessages[channelId]?.entities?.[messageId] || null;
	},
	(messagesState) => {
		return messagesState || {};
	},
);

export const selectLastMessageIdByChannelId = createSelector(selectMessageIdsByChannelId, (ids) => {
	return ids.at(-1);
});

export const selectLastSeenMessage = (channelId: string, messageId: string) =>
	createSelector(
		[(state) => selectLastMessageIdByChannelId(state, channelId), selectUnreadMessageIdByChannelId(channelId)],
		(lastMessageId, unreadMessageId) => {
			return Boolean(messageId === unreadMessageId && messageId !== lastMessageId);
		},
	);

const handleUpdateIsCombineMessage = (
	channelEntity: EntityState<MessagesEntity, string> & {
		id: string;
	},
	messageIds: string[],
	needUpdateFirstMessage = true,
) => {
	if (!messageIds?.length) return;
	const entities = channelEntity.entities;

	const firstMessage = entities[messageIds[0]];
	let prevMessageSenderId = firstMessage.sender_id || '';
	let prevMessageCreateTime = firstMessage.create_time || '';
	let prevMessageCreationTimeMs = firstMessage.creationTimeMs || 0;

	if (needUpdateFirstMessage) {
		firstMessage.isStartedMessageGroup = true;
		firstMessage.isStartedMessageOfTheDay = true;
	}

	messageIds.slice(1, messageIds.length).forEach((id) => {
		const { sender_id, creationTimeMs, create_time } = entities[id];
		const isSameDay = checkSameDayByCreateTime(create_time, prevMessageCreateTime);
		const isContinuousMessages = checkContinuousMessagesByCreateTimeMs(creationTimeMs || 0, prevMessageCreationTimeMs);

		const isStartedMessageGroup = Boolean(sender_id !== prevMessageSenderId || !isSameDay || !isContinuousMessages);

		entities[id].isStartedMessageGroup = isStartedMessageGroup;
		entities[id].isStartedMessageOfTheDay = !isSameDay;

		prevMessageSenderId = sender_id;
		prevMessageCreateTime = create_time;
		prevMessageCreationTimeMs = creationTimeMs || 0;
	});
};

const handleSetManyMessages = ({
	state,
	channelId,
	adapterPayload,
}: {
	state: MessagesState;
	channelId?: string;
	adapterPayload: MessagesEntity[];
}) => {
	if (!channelId) return state;
	if (!state.channelMessages[channelId])
		state.channelMessages[channelId] = channelMessagesAdapter.getInitialState({
			id: channelId,
		});

	state.channelMessages[channelId] = channelMessagesAdapter.setMany(state.channelMessages[channelId], adapterPayload);

	const channelEntity = state.channelMessages[channelId];
	handleUpdateIsCombineMessage(channelEntity, channelEntity.ids.slice(0, adapterPayload.length + 1));
};

const handleRemoveOneMessage = ({ state, channelId, messageId }: { state: MessagesState; channelId: string; messageId: string }) => {
	const channelEntity = state.channelMessages[channelId];
	const index = channelEntity.ids.indexOf(messageId);

	if (index === -1) return;

	const { isStartedMessageGroup, isStartedMessageOfTheDay } = channelEntity.entities[messageId];
	const nextMessageId = channelEntity.ids[index + 1];

	if (nextMessageId && isStartedMessageGroup) {
		channelEntity.entities[nextMessageId].isStartedMessageGroup = isStartedMessageGroup;
		channelEntity.entities[nextMessageId].isStartedMessageOfTheDay = isStartedMessageOfTheDay;
	}

	return channelMessagesAdapter.removeOne(channelEntity, messageId);
};

const handleAddOneMessage = ({ state, channelId, adapterPayload }: { state: MessagesState; channelId: string; adapterPayload: MessagesEntity }) => {
	const messageId = adapterPayload.id;
	state.channelMessages[channelId] = channelMessagesAdapter.addOne(state.channelMessages[channelId], adapterPayload);
	const channelEntity = state.channelMessages[channelId];
	const index = channelEntity.ids.indexOf(messageId);
	if (index === -1) return;

	const startIndex = Math.max(index - 1, 0);

	return handleUpdateIsCombineMessage(channelEntity, channelEntity.ids.slice(startIndex, startIndex + 3), false);
};
