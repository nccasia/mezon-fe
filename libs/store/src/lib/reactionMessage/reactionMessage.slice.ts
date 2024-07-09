import { EmojiDataOptionals, EmojiPlaces, EmojiStorage, IReaction } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiMessageReaction } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';

export const REACTION_FEATURE_KEY = 'reaction';

export const mapReactionToEntity = (reaction: UpdateReactionMessageArgs) => {
	return {
		...reaction,
	} as ReactionEntity;
};

export interface ReactionEntity extends IReaction {
	id: string;
}

export type UpdateReactionMessageArgs = {
	id: string;
	channel_id?: string;
	message_id?: string;
	emoji?: string;
	count?: number;
	sender_id?: string;
	action?: boolean;
};

export type UpdateBulkMessageReactionsArgs = {
	messages: {
		id: string;
		reactions?: ApiMessageReaction[] | undefined;
	}[];
};

export interface ReactionState extends EntityState<ReactionEntity, string> {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	reactionPlaceActive: EmojiPlaces;
	reactionTopState: boolean;
	reactionBottomState: boolean;
	reactionRightState: boolean;
	userReactionPanelState: boolean;
	reactionBottomStateResponsive: boolean;
	messageMatchWithRef: boolean;
	positionOfSmileButton: {
		top: number;
		right: number;
		left: number;
		bottom: number;
	};
	emojiHover: EmojiDataOptionals | null;
	computedMessageReactions: Record<string, EmojiDataOptionals[]>;
}

export const reactionAdapter = createEntityAdapter({
	selectId: (emo: ReactionEntity) => emo.id || '',
});

export const updateReactionMessage = createAsyncThunk(
	'messages/updateReactionMessage',

	async ({ id, channel_id, message_id, sender_id, emoji, count, action }: UpdateReactionMessageArgs, thunkAPI) => {
		try {
			await thunkAPI.dispatch(reactionActions.setReactionDataSocket({ id, channel_id, message_id, sender_id, emoji, count, action }));
		} catch (e) {
			console.log(e);
			return thunkAPI.rejectWithValue([]);
		}
	},
);

export type WriteMessageReactionArgs = {
	id: string;
	channelId: string;
	mode: number;
	messageId: string;
	emoji: string;
	count: number;
	messageSenderId: string;
	actionDelete: boolean;
};

export const writeMessageReaction = createAsyncThunk(
	'messages/writeMessageReaction',
	async ({ id, channelId, mode, messageId, emoji, count, messageSenderId, actionDelete }: WriteMessageReactionArgs, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const session = mezon.sessionRef.current;
			const client = mezon.clientRef.current;
			const socket = mezon.socketRef.current;

			if (!client || !session || !socket) {
				throw new Error('Client is not initialized');
			}

			await socket.writeMessageReaction(id, channelId, mode, messageId, emoji, count, messageSenderId, actionDelete);
		} catch (e) {
			return thunkAPI.rejectWithValue('Error while writing message reaction');
		}
	},
);

export const initialReactionState: ReactionState = reactionAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	reactionPlaceActive: EmojiPlaces.EMOJI_REACTION,
	reactionTopState: false,
	reactionBottomState: false,
	reactionRightState: false,
	userReactionPanelState: false,
	reactionBottomStateResponsive: false,
	messageMatchWithRef: false,
	positionOfSmileButton: {
		top: 0,
		right: 0,
		left: 0,
		bottom: 0,
	},
	emojiHover: null,
	computedMessageReactions: {},
});

export const reactionSlice = createSlice({
	name: REACTION_FEATURE_KEY,
	initialState: initialReactionState,
	reducers: {
		add: reactionAdapter.addOne,
		remove: reactionAdapter.removeOne,

		setEmojiHover(state, action) {
			state.emojiHover = action.payload;
		},
		setReactionPlaceActive(state, action) {
			state.reactionPlaceActive = action.payload;
		},
		setReactionTopState(state, action) {
			state.reactionTopState = action.payload;
		},
		setReactionBottomState(state, action) {
			state.reactionBottomState = action.payload;
		},
		setReactionBottomStateResponsive(state, action) {
			state.reactionBottomStateResponsive = action.payload;
		},

		setReactionRightState(state, action) {
			state.reactionRightState = action.payload;
		},

		setReactionDataSocket: (state, action: PayloadAction<UpdateReactionMessageArgs>) => {
			const reactionDataSocket = {
				...action.payload,
				count: action.payload.count || 1,
			};

			const emojiLastest: EmojiStorage = {
				emoji: reactionDataSocket.emoji ?? '',
				messageId: reactionDataSocket.message_id ?? '',
				senderId: reactionDataSocket.sender_id ?? '',
				action: reactionDataSocket.action ?? false,
			};

			saveRecentEmoji(emojiLastest);

			const isAdd = !action.payload.action;
			// Server not send id
			// We have to find the id of the reaction by message_id and emoji and sender_id
			if (reactionDataSocket.id !== '') {
				const reactionEntities = reactionAdapter.getSelectors().selectAll(state);
				const reaction = reactionEntities.find(
					(reaction) =>
						reaction.message_id === reactionDataSocket.message_id &&
						reaction.emoji === reactionDataSocket.emoji &&
						reaction.sender_id === reactionDataSocket.sender_id,
				);

				if (reaction) {
					reactionDataSocket.id = reaction.id;
				}
			}

			const existing = reactionAdapter.getSelectors().selectById(state, reactionDataSocket.id);
			if (isAdd && !existing) {
				reactionAdapter.addOne(state, mapReactionToEntity(reactionDataSocket));
			} else if (isAdd && existing) {
				reactionAdapter.updateOne(state, {
					id: reactionDataSocket.id,
					changes: {
						count: existing.count + reactionDataSocket.count,
					},
				});
			} else if (!isAdd && existing) {
				reactionAdapter.removeOne(state, reactionDataSocket.id);
			} else {
				// Do nothing when remove reaction and not found
			}

			if (action.payload.message_id) {
				state.computedMessageReactions[action.payload.message_id] = combineMessageReactions(state, action.payload.message_id);
			}
		},

		setUserReactionPanelState(state, action) {
			state.userReactionPanelState = action.payload;
		},
		setMessageMatchWithRef(state, action) {
			state.messageMatchWithRef = action.payload;
		},
		setPositionOfSmileButton(state, action) {
			state.positionOfSmileButton = action.payload;
		},
		updateBulkMessageReactions: (state, action: PayloadAction<UpdateBulkMessageReactionsArgs>) => {
			const { messages } = action.payload;
			for (const message of messages) {
				const reactionsRaw = message.reactions;
				const reactions = (reactionsRaw || []).map((reaction) => {
					const id = reaction.id || '';
					const message_id = message.id;
					return mapReactionToEntity({ ...reaction, id, message_id });
				});
				reactionAdapter.upsertMany(state, reactions);
				state.computedMessageReactions[message.id] = combineMessageReactions(state, message.id);
			}
		},
	},
});
function saveRecentEmoji(emojiLastest: EmojiStorage) {
	const storedEmojis = localStorage.getItem('recentEmojis');
	const emojisRecentParse = storedEmojis ? JSON.parse(storedEmojis) : [];

	const duplicateIndex = emojisRecentParse.findIndex((item: any) => {
		return item.emoji === emojiLastest.emoji && item.senderId === emojiLastest.senderId;
	});

	if (emojiLastest.action === true) {
		if (duplicateIndex !== -1) {
			emojisRecentParse.splice(duplicateIndex, 1);
		}
	} else {
		if (duplicateIndex === -1) {
			emojisRecentParse.push(emojiLastest);
		}
	}

	localStorage.setItem('recentEmojis', JSON.stringify(emojisRecentParse));
}

function combineMessageReactions(state: ReactionState, messageId: string): EmojiDataOptionals[] {
	const reactionEntities = reactionAdapter.getSelectors().selectAll(state);
	const reactions = reactionEntities.filter((reaction) => reaction.message_id === messageId);

	const dataCombined: Record<string, EmojiDataOptionals> = {};

	for (const reaction of reactions) {
		const emoji = reaction.emoji || ('' as string);

		if (reaction.count < 1) {
			continue;
		}

		if (!dataCombined[emoji]) {
			dataCombined[emoji] = {
				emoji,
				senders: [],
				action: false,
				message_id: messageId,
				// TODO: TBD
				id: '',
				channel_id: '',
			};
		}

		const newSender = {
			sender_id: reaction.sender_id,
			count: reaction.count,
		};

		const reactionData = dataCombined[emoji];
		const senderIndex = reactionData.senders.findIndex((sender) => sender.sender_id === newSender.sender_id);

		if (senderIndex === -1) {
			reactionData.senders.push(newSender);
		} else if (reactionData?.senders[senderIndex]) {
			reactionData.senders[senderIndex].count = newSender.count;
		}
	}

	const dataCombinedArray = Object.values(dataCombined);

	return dataCombinedArray;
}

export const reactionReducer = reactionSlice.reducer;

export const reactionActions = {
	...reactionSlice.actions,
	updateReactionMessage,
	writeMessageReaction,
};

const { selectAll, selectEntities } = reactionAdapter.getSelectors();

export const getReactionState = (rootState: { [REACTION_FEATURE_KEY]: ReactionState }): ReactionState => rootState[REACTION_FEATURE_KEY];

export const selectAllEmojiReaction = createSelector(getReactionState, selectAll);

export const selectEmojiReactionEntities = createSelector(getReactionState, selectEntities);

export const selectReactionPlaceActive = createSelector(getReactionState, (state: ReactionState) => state.reactionPlaceActive);

export const selectReactionTopState = createSelector(getReactionState, (state: ReactionState) => state.reactionTopState);

export const selectReactionBottomState = createSelector(getReactionState, (state: ReactionState) => state.reactionBottomState);

export const selectReactionBottomStateResponsive = createSelector(getReactionState, (state: ReactionState) => state.reactionBottomStateResponsive);

export const selectReactionRightState = createSelector(getReactionState, (state: ReactionState) => state.reactionRightState);

export const selectUserReactionPanelState = createSelector(getReactionState, (state: ReactionState) => state.userReactionPanelState);

export const selectMessageMatchWithRef = createSelector(getReactionState, (state: ReactionState) => state.messageMatchWithRef);

export const selectPositionEmojiButtonSmile = createSelector(getReactionState, (state: ReactionState) => state.positionOfSmileButton);

export const selectEmojiHover = createSelector(getReactionState, (state: ReactionState) => state.emojiHover);

export const selectComputedMessageReactions = createSelector(getReactionState, (state: ReactionState) => state.computedMessageReactions);

export const selectIsMessageHasReaction = (messageId: string) =>
	createSelector(selectComputedMessageReactions, (computedMessageReactions) => {
		return computedMessageReactions[messageId] && computedMessageReactions[messageId].length > 0;
	});

export const selectComputedReactionsByMessageId = (messageId: string) =>
	createSelector(selectComputedMessageReactions, (computedMessageReactions) => {
		return computedMessageReactions[messageId] || [];
	});
