import { IPinMessage, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import memoize from 'memoizee';
import { ApiPinMessageRequest } from 'mezon-js/api.gen';
import { MezonValueContext, ensureSession, ensureSocket, getMezonCtx } from '../helpers';

export const PIN_MESSAGE_FEATURE_KEY = 'pinmessages';

/*
 * Update these interfaces according to your requirements.
 */
export interface PinMessageEntity extends IPinMessage {
	id: string; // Primary ID
}

export interface PinMessageState extends EntityState<PinMessageEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const pinMessageAdapter = createEntityAdapter<PinMessageEntity>();

type fetchChannelPinMessagesPayload = {
	channelId: string;
	noCache?: boolean;
};

const CHANNEL_PIN_MESSAGES_CACHED_TIME = 1000 * 60 * 3;
const fetchChannelPinMessagesCached = memoize(
	(mezon: MezonValueContext, channelId: string) => mezon.client.getPinMessagesList(mezon.session, channelId),
	{
		promise: true,
		maxAge: CHANNEL_PIN_MESSAGES_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[0].session.username;
		},
	},
);

export const mapChannelPinMessagesToEntity = (pinMessageRes: ApiPinMessageRequest) => {
	return { ...pinMessageRes, id: pinMessageRes.message_id || '' };
};

export const fetchChannelPinMessages = createAsyncThunk(
	'pinmessage/fetchChannelPinMessages',
	async ({ channelId, noCache }: fetchChannelPinMessagesPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		if (noCache) {
			fetchChannelPinMessagesCached.clear(mezon, channelId);
		}
		const response = await fetchChannelPinMessagesCached(mezon, channelId);
		if (!response) {
			return [];
		}

		if (!response.pin_messages_list) {
			return '';
		}

		const pinMessages = response.pin_messages_list.map((pinMessageRes) => mapChannelPinMessagesToEntity(pinMessageRes));
		return pinMessages;
	},
);
type SetChannelPinMessagesPayload = {
	channel_id: string;
	message_id: string;
};
export const setChannelPinMessage = createAsyncThunk(
	'pinmessage/setChannelPinMessage',
	async ({ channel_id, message_id }: SetChannelPinMessagesPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			channel_id: channel_id,
			message_id: message_id,
		};
		const response = await mezon.client.createPinMessage(mezon.session, body);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(fetchChannelPinMessages({ channelId: channel_id, noCache: true }));
		return response;
	},
);

export const deleteChannelPinMessage = createAsyncThunk(
	'pinmessage/deleteChannelPinMessage',
	async ({ channel_id, message_id }: SetChannelPinMessagesPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deletePinMessage(mezon.session, message_id);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(fetchChannelPinMessages({ channelId: channel_id, noCache: true }));
		return response;
	},
);

type UpdatePinMessage = {
	clanId: string;
	channelId: string;
	messageId: string;
};

export const joinPinMessage = createAsyncThunk('messages/joinPinMessage', async ({ clanId, channelId, messageId }: UpdatePinMessage, thunkAPI) => {
	try {
		const mezon = await ensureSocket(getMezonCtx(thunkAPI));
		const now = Math.floor(Date.now() / 1000);
		await mezon.socketRef.current?.writeLastPinMessage(clanId, channelId, 0, messageId, now.toString(), 1);
	} catch (e) {
		console.error('Error updating last seen message', e);
	}
});

export const updateLastSeenPin = createAsyncThunk(
	'messages/updateLastPinMessage',
	async ({ clanId, channelId, messageId }: UpdatePinMessage, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const now = Math.floor(Date.now() / 1000);
			await mezon.socketRef.current?.writeLastPinMessage(clanId, channelId, 0, messageId, now.toString(), 0);
		} catch (e) {
			console.error('Error updating last seen message', e);
		}
	},
);

export const initialPinMessageState: PinMessageState = pinMessageAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
});

export const pinMessageSlice = createSlice({
	name: PIN_MESSAGE_FEATURE_KEY,
	initialState: initialPinMessageState,
	reducers: {
		add: pinMessageAdapter.addOne,
		addMany: pinMessageAdapter.addMany,
		remove: pinMessageAdapter.removeOne,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannelPinMessages.pending, (state: PinMessageState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchChannelPinMessages.fulfilled, (state: PinMessageState, action: PayloadAction<any>) => {
				pinMessageAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchChannelPinMessages.rejected, (state: PinMessageState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const pinMessageReducer = pinMessageSlice.reducer;

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
 *   dispatch(usersActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const pinMessageActions = {
	...pinMessageSlice.actions,
	fetchChannelPinMessages,
	setChannelPinMessage,
	deleteChannelPinMessage,
	updateLastSeenPin,
	joinPinMessage,
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
 * const entities = useSelector(selectAllUsers);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectEntities } = pinMessageAdapter.getSelectors();

export const getPinMessageState = (rootState: { [PIN_MESSAGE_FEATURE_KEY]: PinMessageState }): PinMessageState => rootState[PIN_MESSAGE_FEATURE_KEY];
export const selectPinMessageEntities = createSelector(getPinMessageState, selectEntities);
export const selectPinMessageByChannelId = (channelId?: string | null) =>
	createSelector(selectPinMessageEntities, (entities) => {
		const messageIds = Object.values(entities);
		return messageIds.filter((messageId) => messageId.channel_id?.includes(channelId || ''));
	});
export const selectLastPinMessageByChannelId = (channelId?: string | null) =>
	createSelector(selectPinMessageByChannelId(channelId), (filteredMessages) => {
		return filteredMessages[filteredMessages.length - 1]?.id || null;
	});