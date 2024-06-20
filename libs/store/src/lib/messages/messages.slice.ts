import { EmojiDataOptionals, IMessageSendPayload, IMessageWithUser, LIMIT_MESSAGE, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice, lruMemoize } from '@reduxjs/toolkit';
import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import memoize from 'memoizee';
import { ChannelMessage, ChannelMessageAck, ChannelStreamMode } from 'mezon-js';
import { MezonValueContext, ensureSession, ensureSocket, getMezonCtx, sleep } from '../helpers';
import { seenMessagePool } from './SeenMessagePool';
import { withError } from '../errors/helpers';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { channelsActions } from '../channels/channels.slice';
import { shallowEqual } from 'react-redux';

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

export interface MessagesState extends EntityState<MessagesEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	isSending?: boolean;
	unreadMessagesEntries?: Record<string, string>;
	typingUsers?: Record<string, UserTypingState>;
	paramEntries: Record<string, FetchMessageParam>;
	openOptionMessageState: boolean;
	quantitiesMessageRemain: number;
	dataReactionGetFromLoadMessage: EmojiDataOptionals[];
	channelMessagesIds: Record<string, string[]>;
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
		const reactionData: EmojiDataOptionals[] = messages.flatMap((message) => {
			if (!message.reactions) return [];
			const emojiDataItems: Record<string, EmojiDataOptionals> = {};
			message.reactions.forEach((reaction) => {
				const key = `${message.id}_${reaction.sender_id}_${reaction.emoji}`;

				if (!emojiDataItems[key]) {
					emojiDataItems[key] = {
						id: reaction.id,
						emoji: reaction.emoji,
						senders: [
							{
								sender_id: reaction.sender_id,
								count: reaction.count,
								emojiIdList: [],
								sender_name: '',
								avatar: '',
							},
						],
						channel_id: message.channel_id,
						message_id: message.id,
					};
				} else {
					const existingItem = emojiDataItems[key];

					if (existingItem.senders.length > 0) {
						existingItem.senders[0].count = reaction.count;
					}
				}
			});
			return Object.values(emojiDataItems);
		});

		if (reactionData.length > 0) {
			thunkAPI.dispatch(messagesActions.setDataReactionGetFromMessage(reactionData));
		}

		const hasMore = Number(response.messages.length) >= LIMIT_MESSAGE;

		thunkAPI.dispatch(messagesActions.setMessageParams({ channelId, param: { lastLoadMessageId: messages[messages.length - 1].id, hasMore } }));

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
	channelLabel: string;
	messageId: string;
};

export const updateLastSeenMessage = createAsyncThunk(
	'messages/updateLastSeenMessage',
	async ({ channelId, channelLabel, messageId }: UpdateMessageArgs, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const now = Math.floor(Date.now() / 1000);
			await mezon.socketRef.current?.writeLastSeenMessage(
				channelId,
				channelLabel,
				ChannelStreamMode.STREAM_MODE_CHANNEL,
				messageId,
				now.toString(),
			);
		} catch (e) {
			return thunkAPI.rejectWithValue('Error updating last seen message');
		}
	},
	{
		condition: (args, { getState }) => {
			const state = getState() as MessagesRootState;
			const message = selectMessageByMessageId(args.messageId)(state);
			if (!message) {
				return false;
			}
			if (message.isSending) {
				return false;
			}
			return true;
		}
	}
);

type SendMessagePayload = {
	clanId: string;
	channelId: string;
	channelLabel: string;
	content: IMessageSendPayload;
	mentions?: Array<ApiMessageMention>;
	attachments?: Array<ApiMessageAttachment>;
	references?: Array<ApiMessageRef>;
	anonymous?: boolean;
	mentionEveryone?: boolean;
	mode: number;
	senderId: string;
};

export const sendMessage = createAsyncThunk(
	'messages/sendMessage',
	async (payload: SendMessagePayload, thunkAPI) => {
		const { content, mentions, attachments, references, anonymous, mentionEveryone, channelId, mode, clanId, senderId, channelLabel } = payload;
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

			const res = await socket.writeChatMessage(
				clanId,
				channelId,
				channelLabel,
				mode,
				content,
				mentions,
				attachments,
				references,
				anonymous,
				mentionEveryone,
			);
			
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
				channel_label: channelLabel,
				// @ts-ignore
				content: content,
				create_time: new Date().toISOString(),
				sender_id: senderId,
				username: '',
				avatar: '',
				isSending: true,
		
			};
			const fakeMess = mapMessageChannelToEntity(fakeMessage);

			thunkAPI.dispatch(messagesActions.newMessage(fakeMess));

			const res = await sendWithRetry(1);

			const timestamp = Date.now() / 1000;
			thunkAPI.dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId, timestamp }));

			const mess = { ...fakeMess, id: res.message_id, create_time: res.create_time };
			
			thunkAPI.dispatch(messagesActions.markAsSent({id, mess }));
		}

		try {
			await fakeItUntilYouMakeIt();
		} catch (error) {
			console.error('Error sending message', error);
			thunkAPI.dispatch(messagesActions.markAsError(id));
			return thunkAPI.rejectWithValue('Error sending message');
		}
	}
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

const messagesAdapter = createEntityAdapter<MessagesEntity>({
	sortComparer: orderMessageByTimeMsAscending,
});

export const initialMessagesState: MessagesState = messagesAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	isSending: false,
	unreadMessagesEntries: {},
	typingUsers: {},
	paramEntries: {},
	openOptionMessageState: false,
	quantitiesMessageRemain: 0,
	dataReactionGetFromLoadMessage: [],
	channelMessagesIds: {},
});

export type SetCursorChannelArgs = {
	channelId: string;
	param: FetchMessageParam;
};
export type MarkAsSentArgs = {
	id: string;
	mess: IMessageWithUser;
};

export const buildTypingUserKey = (channelId: string, userId: string) => `${channelId}__${userId}`;

const filterChannelMessagesIds = (updatedMessagesState: MessagesState, channelId: string) => {
	return updatedMessagesState.ids.filter((id) => updatedMessagesState.entities[id]?.channel_id === channelId);
};

function updateChannelMessagesIds(state: MessagesState, channelId: string, updatedMessagesState: MessagesState) {
	state.channelMessagesIds = {
		...state.channelMessagesIds,
		[channelId]: filterChannelMessagesIds(updatedMessagesState, channelId),
	}
}

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
			const code = action.payload.code;
			const channelId = action.payload.channel_id;
			let updatedMessagesState = state;
			switch (code) {
				case 0:
					if(state.entities[action.payload.id]) {
						messagesAdapter.setOne(state, action.payload);
					} else {
						messagesAdapter.addOne(state, action.payload);
					}
					break;
				case 1:
					updatedMessagesState = messagesAdapter.updateOne(state, {
						id: action.payload.id,
						changes: {
							content: action.payload.content,
							update_time: action.payload.update_time,
						},
					});
					break;
				case 2:
					updatedMessagesState = messagesAdapter.removeOne(state, action.payload.id);
					break;
				default:
					break;
			}

			if (channelId) {
				// TODO: check duplicates with setChannelLastMessage
				state.unreadMessagesEntries = {
					...state.unreadMessagesEntries,
					[action.payload.channel_id]: action.payload.id,
				};
				const typingUserKey = buildTypingUserKey(action.payload.channel_id, action.payload.sender_id || '');

				if (state?.typingUsers?.[typingUserKey]) {
					delete state.typingUsers[typingUserKey];
				}

				// update channelMessagesIds
				updateChannelMessagesIds(state, channelId, updatedMessagesState)
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
		markAsSent: (state, action: PayloadAction<MarkAsSentArgs>) => {
			console.log('markAsSent', action.payload);
			const { mess, id } = action.payload;
			const channelId = mess.channel_id;
			
			// Add the new message if it doesn't exist
			if (!state.entities[mess.id]) {
				messagesAdapter.addOne(state, mess);
			}
				
			// Remove the message with the old id
			messagesAdapter.removeOne(state, id);
		
			state.channelMessagesIds[channelId] = filterChannelMessagesIds(state, channelId);
		},
		markAsError: (state, action: PayloadAction<string>) => {
			messagesAdapter.updateOne(state, {
				id: action.payload,
				changes: {
					isError: true,
				},
			});
		},
		remove: (state, action: PayloadAction<string>) => {
			const message = state.entities[action.payload];
			messagesAdapter.removeOne(state, action.payload);
			const channelId = message?.channel_id;
			if (channelId) {
				state.channelMessagesIds[channelId] = filterChannelMessagesIds(state, channelId);
			}
		},
		removeAll: (state) => {
			messagesAdapter.removeAll(state);
			state.channelMessagesIds = {};
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

		setDataReactionGetFromMessage(state, action) {
			state.dataReactionGetFromLoadMessage = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMessages.pending, (state: MessagesState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchMessages.fulfilled, (state: MessagesState, action: PayloadAction<MessagesEntity[], string, FetchMessagesMeta>) => {
				const isNew = action.payload.some(({ id }) => !state.entities[id]);

				if (!isNew) return state;

				const reversedMessages = action.payload.reverse();
				messagesAdapter.setMany(state, reversedMessages);
				state.loadingStatus = 'loaded';
				const channelId = action?.meta?.arg?.channelId;
				if (channelId) {
					state.channelMessagesIds[channelId] = filterChannelMessagesIds(state, channelId);
				}
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
const { selectAll, selectEntities, selectById } = messagesAdapter.getSelectors();

export const getMessagesState = (rootState: { [MESSAGES_FEATURE_KEY]: MessagesState }): MessagesState => rootState[MESSAGES_FEATURE_KEY];

export const selectAllMessages = createSelector(getMessagesState, selectAll);

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

export const selectMessagesEntities = createSelector(getMessagesState, selectEntities);

export const selectChannelMessagesIds = createSelector(getMessagesState, (state) => state.channelMessagesIds);

export const selectOpenOptionMessageState = createSelector(getMessagesState, (state: MessagesState) => state.openOptionMessageState);

export const selectMessageByChannelId = (channelId?: string | null) =>
	createSelector(selectMessagesEntities, (entities) => {
		const messages = Object.values(entities);
		const sortedMessages = messages.slice().sort(orderMessageByDate);
		return sortedMessages.filter((message) => message && message.channel_id === channelId);
	});

export const selectMessageByUserId = (channelId?: string | null, senderId?: string | null) =>
	createSelector(selectMessageByChannelId(channelId), (messages) => {
		return messages.filter((message) => message.sender_id === senderId);
	});

export const selectLastMessageByChannelId = (channelId?: string | null) =>
	createSelector(selectMessageByChannelId(channelId), (messages) => {
		return messages.shift();
	});

export const selectLastMessageIdByChannelId = (channelId?: string | null) =>
	createSelector(selectLastMessageByChannelId(channelId), (message) => {
		return message?.id;
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
	createSelector(selectMessagesEntities, (messageEntities) => messageEntities[messageId]);

export const selectQuantitiesMessageRemain = createSelector(getMessagesState, (state) => state.quantitiesMessageRemain);

export const selectDataReactionGetFromMessage = createSelector(getMessagesState, (state) => state.dataReactionGetFromLoadMessage);

// V2

export const selectMessageIdsByChannelIdV2 = createSelector(
	[selectChannelMessagesIds, (_, channelId) => channelId],
	(channelMessagesIds, channelId) => {
		return channelId ? channelMessagesIds?.[channelId] : null;
	},
	{
		memoize: lruMemoize,
		memoizeOptions: {
			equalityCheck: shallowEqual,
			resultEqualityCheck: shallowEqual,
			maxSize: 10,
		},
		argsMemoize: lruMemoize,
		argsMemoizeOptions: {
			equalityCheck: shallowEqual,
			resultEqualityCheck: shallowEqual,
			maxSize: 10,
		},
	},
);

export const selectMessageEntityById = createSelector([getMessagesState, (_, messageId) => messageId], (messagesState, messageId) =>
	selectById(messagesState, messageId),
);

export const selectPreviousMessageByMessageId = (channelId: string, messageId: string) =>
	createSelector([(state) => selectMessageIdsByChannelIdV2(state, channelId), getMessagesState], (messageIds, messagesState) => {
		const prevMessageId = messageIds?.find((_, index) => messageIds[index + 1] === messageId);
		if (!prevMessageId) return undefined;
		const prevMessageEntity = selectById(messagesState, prevMessageId);
		if (prevMessageEntity && typeof prevMessageEntity.content === 'object' && typeof (prevMessageEntity.content as any).id === 'string') {
			return prevMessageEntity.content;
		}
		return prevMessageEntity;
	});

export const selectLastSeenMessage = (channelId: string, messageId: string) =>
	createSelector([selectLastMessageIdByChannelId(channelId), selectUnreadMessageIdByChannelId(channelId)], (lastMessageId, unreadMessageId) => {
		return Boolean(messageId === unreadMessageId && messageId !== lastMessageId);
	});

