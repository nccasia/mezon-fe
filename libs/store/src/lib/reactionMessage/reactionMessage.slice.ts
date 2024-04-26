import { EmojiDataOptionals, EmojiPlaces, IEmoji } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

export const REACTION_FEATURE_KEY = 'reaction';

export const mapReactionToEntity = (reaction: UpdateReactionMessageArgs) => {
	return reaction;
};

export interface ReactionEntity extends IEmoji {
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

export interface ReactionState extends EntityState<ReactionEntity, string> {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	reactionPlaceActive: EmojiPlaces;
	reactionBottomState: boolean;
	reactionRightState: boolean;
	reactionDataSocket: EmojiDataOptionals;
	reactionDataServerAndSocket: EmojiDataOptionals[];
	userReactionPanelState: boolean;
	dataReationFetch: EmojiDataOptionals[];
}

export const reactionAdapter = createEntityAdapter({
	selectId: (emo: ReactionEntity) => emo.id || emo.name || '',
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

export const initialReactionState: ReactionState = reactionAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	reactionPlaceActive: EmojiPlaces.EMOJI_REACTION,
	reactionBottomState: false,
	reactionRightState: false,
	reactionDataSocket: {
		action: undefined,
		id: '',
		emoji: '',
		senders: [{ sender_id: '', count: 0, emojiIdList: [], sender_name: '', avatar: '' }],
		channel_id: '',
		message_id: '',
	},
	reactionDataServerAndSocket: [],
	userReactionPanelState: false,
	dataReationFetch: [],
});

export const reactionSlice = createSlice({
	name: REACTION_FEATURE_KEY,
	initialState: initialReactionState,
	reducers: {
		add: reactionAdapter.addOne,
		remove: reactionAdapter.removeOne,

		setReactionDataFetch(state, action) {
			state.dataReationFetch = action.payload;
		},

		setReactionPlaceActive(state, action) {
			state.reactionPlaceActive = action.payload;
		},
		setReactionBottomState(state, action) {
			state.reactionBottomState = action.payload;
		},
		setReactionRightState(state, action) {
			state.reactionRightState = action.payload;
		},

		setReactionDataSocket: (state, action: PayloadAction<UpdateReactionMessageArgs>) => {
			state.reactionDataSocket = {
				action: action.payload.action,
				id: action.payload.id ?? '',
				emoji: action.payload.emoji ?? '',
				senders: [
					{
						sender_id: action.payload.sender_id || '',
						count: action.payload.action ? action.payload.count && action.payload.count : 1,
						emojiIdList: [],
						sender_name: '',
						avatar: '',
					},
				],
				channel_id: action.payload.channel_id ?? '',
				message_id: action.payload.message_id ?? '',
			};
			
			// if (!action.payload.action) {
			// 	state.reactionDataServerAndSocket.push(state.reactionDataSocket);
			// } else if (action.payload.action) {
			// 	const { action, ...newStateReaction } = state.reactionDataSocket;
			// 	const removedReactionData = state.reactionDataServerAndSocket.filter(
			// 		(item) =>
			// 			item.emoji !== newStateReaction.emoji ||
			// 			item.channel_id !== newStateReaction.channel_id ||
			// 			item.message_id !== newStateReaction.message_id ||
			// 			item.senders[0].sender_id !== newStateReaction.senders[0].sender_id,
			// 	);
			// 	state.reactionDataServerAndSocket = removedReactionData;
			// }
		},

		setDataReactionFromServe(state, action) {
			state.reactionDataServerAndSocket = action.payload;
		},
		setUserReactionPanelState(state, action) {
			state.userReactionPanelState = action.payload;
		},
	},
});

export const reactionReducer = reactionSlice.reducer;

export const reactionActions = {
	...reactionSlice.actions,
	updateReactionMessage,
};

const { selectAll, selectEntities } = reactionAdapter.getSelectors();

export const getReactionState = (rootState: { [REACTION_FEATURE_KEY]: ReactionState }): ReactionState => rootState[REACTION_FEATURE_KEY];

export const selectAllEmojiReaction = createSelector(getReactionState, selectAll);

export const selectEmojiReactionEntities = createSelector(getReactionState, selectEntities);

export const selectReactionPlaceActive = createSelector(getReactionState, (state: ReactionState) => state.reactionPlaceActive);

export const selectReactionBottomState = createSelector(getReactionState, (state: ReactionState) => state.reactionBottomState);

export const selectReactionRightState = createSelector(getReactionState, (state: ReactionState) => state.reactionRightState);

export const selectMessageReacted = createSelector(getReactionState, (state: ReactionState) => state.reactionDataSocket);

export const selectReactionDataSocket = createSelector(getReactionState, (state: ReactionState) => state.reactionDataServerAndSocket);

export const selectUserReactionPanelState = createSelector(getReactionState, (state: ReactionState) => state.userReactionPanelState);

export const selectReactionDataFetch = createSelector(getReactionState, (state: ReactionState) => state.dataReationFetch);

