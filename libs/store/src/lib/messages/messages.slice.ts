import { EmojiDataOptionals, IMessageWithUser, LIMIT_MESSAGE, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import memoize from 'memoizee';
import { ChannelMessage, ChannelStreamMode } from 'mezon-js';
import { ApiSearchMessageRequest, ApiSearchMessageResponse } from 'mezon-js/api.gen';
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
	isSearchMessage: boolean;
	searchMessagesChannel: ApiSearchMessageResponse | null;
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
			// set default value
			if (args[2] === undefined) {
				args[2] = '';
			}
			if (args[3] === undefined) {
				args[3] = 1;
			}
			return args[1] + args[2] + args[3] + args[0].session.token;
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
			return thunkAPI.rejectWithValue([]);
		}

		//const currentHasMore = selectHasMoreMessageByChannelId(channelId)(getMessagesRootState(thunkAPI));
		const messages = response.messages.map((item) => mapMessageChannelToEntity(item, response.last_seen_message?.id));
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

		// thunkAPI.dispatch(reactionActions.setDataReactionFromServe(reactionData));

		if (reactionData.length > 0) {
			thunkAPI.dispatch(messagesActions.setDataReactionGetFromMessage(reactionData));
		}

		const hasMore = Number(response.messages.length) >= LIMIT_MESSAGE;
		thunkAPI.dispatch(messagesActions.setMessageParams({ channelId, param: { lastLoadMessageId: messages[messages.length - 1].id, hasMore } }));
		thunkAPI.dispatch(messagesActions.setQuatitiesMessageRemain(response.messages.length));

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

export const searchChannelMessages = createAsyncThunk(
	'messages/searchChannelMessages',
	async ({ filters, from, size, sorts }: ApiSearchMessageRequest, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));

			const response = await mezon.client.searchMessage(mezon.session, { filters, from, size, sorts });

			if (response) {
				thunkAPI.dispatch(messagesActions.setSearchMessages(response));
			}
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
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
	isSearchMessage: false,
	searchMessagesChannel: {},
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
		setMessageParams: (state, action: PayloadAction<SetCursorChannelArgs>) => {
			state.paramEntries[action.payload.channelId] = action.payload.param;
		},
		setQuatitiesMessageRemain: (state, action) => {
			state.quantitiesMessageRemain = action.payload;
		},
		newMessage: (state, action: PayloadAction<MessagesEntity>) => {
			const code = action.payload.code;
			switch (code) {
				case 0:
					messagesAdapter.addOne(state, action.payload);
					break;
				case 1:
					messagesAdapter.updateOne(state, {
						id: action.payload.id,
						changes: {
							content: action.payload.content,
							update_time: action.payload.update_time
						},
					});
					break;
				case 2:
					messagesAdapter.removeOne(state, action.payload.id);
					break;
				default:
					break;
			}

			if (action.payload.channel_id) {
				// TODO: check duplicates with setChannelLastMessage
				state.unreadMessagesEntries = {
					...state.unreadMessagesEntries,
					[action.payload.channel_id]: action.payload.id,
				};
				const typingUserKey = buildTypingUserKey(action.payload.channel_id, action.payload.sender_id || '');

				if (state?.typingUsers?.[typingUserKey]) {
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
		setIsSearchMessage: (state, action: PayloadAction<boolean>) => {
			state.isSearchMessage = action.payload;
		},
		setSearchMessages: (state, action: PayloadAction<ApiSearchMessageResponse>) => {
			state.searchMessagesChannel = action.payload;
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

		builder.addCase(updateLastSeenMessage.fulfilled, (state: MessagesState) => {});
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
	jumpToMessage,
	searchChannelMessages,
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
export const selectIsSearchMessage = createSelector(getMessagesState, (state) => state.isSearchMessage);

export const selectSearchMessagesChannel = createSelector(getMessagesState, (state) => state.searchMessagesChannel);
