import { ActiveDm, IChannel, LoadingStatus } from '@mezon/utils';
import { EntityState, GetThunkAPI, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ChannelMessage, ChannelType } from 'mezon-js';
import { ApiChannelDescription, ApiCreateChannelDescRequest, ApiDeleteChannelDescRequest, ApiUser } from 'mezon-js/api.gen';
import { channelMembersActions } from '../channelmembers/channel.members';
import { channelsActions, fetchChannelsCached } from '../channels/channels.slice';
import { hashtagDmActions } from '../channels/hashtagDm.slice';
import { clansActions } from '../clans/clans.slice';
import { ensureSession, getMezonCtx } from '../helpers';
import { MessagesEntity, messagesActions } from '../messages/messages.slice';
import { pinMessageActions } from '../pinMessages/pinMessage.slice';

export const DIRECT_FEATURE_KEY = 'direct';

export interface DirectEntity extends IChannel {
	id: string;
}
interface DMMeta {
	id: string;
	lastSeenTimestamp: number;
	lastSentTimestamp: number;
	notifiCount: number;
}

const dmMetaAdapter = createEntityAdapter<DMMeta>();

export interface DirectState extends EntityState<DirectEntity, string> {
	loadingStatus: LoadingStatus;
	socketStatus: LoadingStatus;
	error?: string | null;
	currentDirectMessageId?: string | null;
	currentDirectMessageType?: number;
	dmMetadata: EntityState<DMMeta, string>;
	statusDMChannelUnread: Record<string, boolean>;
}

function extractDMMeta(channel: DirectEntity): DMMeta {
	return {
		id: channel.id,
		lastSeenTimestamp: Number(channel.last_seen_message?.timestamp_seconds),
		lastSentTimestamp: Number(channel.last_sent_message?.timestamp_seconds),
		notifiCount: Number(channel.count_mess_unread || 0),
	};
}
export interface DirectRootState {
	[DIRECT_FEATURE_KEY]: DirectState;
}

function getDirectRootState(thunkAPI: GetThunkAPI<unknown>): DirectRootState {
	return thunkAPI.getState() as DirectRootState;
}

export const directAdapter = createEntityAdapter<DirectEntity>();

export const mapDmGroupToEntity = (channelRes: ApiChannelDescription) => {
	return { ...channelRes, id: channelRes.channel_id || '' };
};

export const createNewDirectMessage = createAsyncThunk('direct/createNewDirectMessage', async (body: ApiCreateChannelDescRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.createChannelDesc(mezon.session, body);
		if (response) {
			thunkAPI.dispatch(directActions.setDmGroupCurrentId(response.channel_id ?? ''));
			thunkAPI.dispatch(directActions.setDmGroupCurrentType(response.type ?? 0));
			if (response.type !== ChannelType.CHANNEL_TYPE_VOICE) {
				await thunkAPI.dispatch(
					channelsActions.joinChat({
						clanId: '0',
						channelId: response.channel_id as string,
						channelType: response.type as number,
					}),
				);
			}
			return response;
		} else {
			return thunkAPI.rejectWithValue([]);
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const closeDirectMessage = createAsyncThunk('direct/closeDirectMessage', async (body: ApiDeleteChannelDescRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.closeDirectMess(mezon.session, body);
		if (response) {
			thunkAPI.dispatch(directActions.fetchDirectMessage({ noCache: true }));
			return response;
		} else {
			return thunkAPI.rejectWithValue([]);
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const openDirectMessage = createAsyncThunk(
	'direct/openDirectMessage',
	async ({ channelId, clanId }: { channelId: string; clanId: string }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const dmChannel = selectDirectById(channelId)(getDirectRootState(thunkAPI)) || {};
			if (dmChannel?.active !== ActiveDm.OPEN_DM && clanId === '0') {
				await mezon.client.openDirectMess(mezon.session, { channel_id: channelId });
			}
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	},
);

type fetchDmGroupArgs = {
	cursor?: string;
	limit?: number;
	forward?: number;
	channelType?: number;
	noCache?: boolean;
};

export const fetchDirectMessage = createAsyncThunk(
	'direct/fetchDirectMessage',
	async ({ channelType = ChannelType.CHANNEL_TYPE_GROUP, noCache }: fetchDmGroupArgs, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		if (noCache) {
			fetchChannelsCached.clear(mezon, 100, 1, '', channelType);
		}
		const response = await fetchChannelsCached(mezon, 100, 1, '', channelType);

		if (!response.channeldesc) {
			return [];
		}
		if (Date.now() - response.time < 100) {
			const listStatusUnreadDM = response.channeldesc.map((channel) => {
				const status = getStatusUnread(
					Number(channel.last_seen_message?.timestamp_seconds),
					Number(channel.last_sent_message?.timestamp_seconds),
				);
				return { dmId: channel.channel_id ?? '', isUnread: status };
			});
			thunkAPI.dispatch(directActions.setAllStatusDMUnread(listStatusUnreadDM));
		}

		const sorted = response.channeldesc.sort((a: ApiChannelDescription, b: ApiChannelDescription) => {
			if (
				a === undefined ||
				b === undefined ||
				a.last_sent_message === undefined ||
				a.last_seen_message?.id === undefined ||
				b.last_sent_message === undefined ||
				b.last_seen_message?.id === undefined
			) {
				return 0;
			}
			if (a.last_sent_message.id && b.last_sent_message.id && a.last_sent_message.id < b.last_sent_message.id) {
				return 1;
			}

			return -1;
		});
		const channels = sorted.map(mapDmGroupToEntity);
		const meta = channels.map((ch) => extractDMMeta(ch));
		thunkAPI.dispatch(directActions.updateBulkDirectMetadata(meta));
		return channels;
	},
);

interface JoinDirectMessagePayload {
	directMessageId: string;
	channelName?: string;
	type?: number;
	noCache?: boolean;
	isFetchingLatestMessages?: boolean;
}
interface members {
	id: string;
	channelId: string | undefined;
	userChannelId: string | undefined;
	role_id?: string[] | undefined;
	thread_id?: string | undefined;
	user?: ApiUser | undefined;
}

export type StatusDMUnreadArgs = {
	dmId: string;
	isUnread: boolean;
};

export const joinDirectMessage = createAsyncThunk<void, JoinDirectMessagePayload>(
	'direct/joinDirectMessage',
	async ({ directMessageId, type, noCache = false, isFetchingLatestMessages = false }, thunkAPI) => {
		try {
			thunkAPI.dispatch(directActions.setDmGroupCurrentId(directMessageId));
			thunkAPI.dispatch(directActions.setDmGroupCurrentType(type??ChannelType.CHANNEL_TYPE_DM));
			thunkAPI.dispatch(messagesActions.fetchMessages({ channelId: directMessageId, noCache, isFetchingLatestMessages }));
			const fetchChannelMembersResult = await thunkAPI.dispatch(
				channelMembersActions.fetchChannelMembers({
					clanId: '',
					channelId: directMessageId,
					channelType: ChannelType.CHANNEL_TYPE_TEXT,
					noCache,
				}),
			);
			const members = fetchChannelMembersResult.payload as members[];
			if (type === ChannelType.CHANNEL_TYPE_DM && members && members.length > 0) {
				const userIds = members.map((member: any) => member.user.id);
				thunkAPI.dispatch(hashtagDmActions.fetchHashtagDm({ userIds: userIds, directId: directMessageId }));
			}
			thunkAPI.dispatch(pinMessageActions.fetchChannelPinMessages({ channelId: directMessageId }));
			thunkAPI.dispatch(clansActions.joinClan({ clanId: '0' }));
		} catch (error) {
			console.log(error);
			return thunkAPI.rejectWithValue([]);
		}
	},
);

export const initialDirectState: DirectState = directAdapter.getInitialState({
	loadingStatus: 'not loaded',
	socketStatus: 'not loaded',
	error: null,
	dmMetadata: dmMetaAdapter.getInitialState(),
	statusDMChannelUnread: {},
});

export const directSlice = createSlice({
	name: DIRECT_FEATURE_KEY,
	initialState: initialDirectState,
	reducers: {
		add: directAdapter.addOne,
		remove: directAdapter.removeOne,
		setDmGroupCurrentId: (state, action: PayloadAction<string>) => {
			state.currentDirectMessageId = action.payload;
		},
		setDmGroupCurrentType: (state, action: PayloadAction<number>) => {
			state.currentDirectMessageType = action.payload;
		},
		updateDMSocket: (state, action: PayloadAction<ChannelMessage>) => {
			const payload = action.payload;
			const timestamp = Date.now() / 1000;
			const dmChannel = directAdapter.getSelectors().selectById(state, payload.channel_id);

			directAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: {
					last_sent_message: {
						content: payload.content,
						id: payload.id,
						sender_id: payload.sender_id,
						timestamp_seconds: timestamp,
					},
				},
			});

			if (payload.clan_id === '0' && dmChannel?.active !== ActiveDm.OPEN_DM) {
				directAdapter.updateOne(state, {
					id: payload.channel_id,
					changes: {
						active: ActiveDm.OPEN_DM,
					},
				});
			}
		},
		updateLastSeenTime: (state, action: PayloadAction<MessagesEntity>) => {
			const payload = action.payload;
			const timestamp = Date.now() / 1000;
			directAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: {
					last_seen_message: {
						content: payload.content,
						id: payload.id,
						sender_id: payload.sender_id,
						timestamp_seconds: timestamp,
					},
				},
			});
		},
		updateBulkDirectMetadata: (state, action: PayloadAction<DMMeta[]>) => {
			state.dmMetadata = dmMetaAdapter.upsertMany(state.dmMetadata, action.payload);
		},
		setAllStatusDMUnread: (state, action: PayloadAction<StatusDMUnreadArgs[]>) => {
			for (const i of action.payload) {
				state.statusDMChannelUnread[i.dmId] = i.isUnread;
			}
		},
		setDirectLastSentTimestamp: (state, action: PayloadAction<{ channelId: string; timestamp: number }>) => {
			const channel = state.dmMetadata.entities[action.payload.channelId];
			if (channel) {
				channel.lastSentTimestamp = action.payload.timestamp;
				const status = getStatusUnread(channel.lastSeenTimestamp, action.payload.timestamp);
				state.statusDMChannelUnread[action.payload.channelId] = status;
			}
		},
		setCountMessUnread: (state, action: PayloadAction<{ channelId: string }>) => {
			const { channelId } = action.payload;
			const entity = state.entities[channelId];
			if (entity) {
				directAdapter.updateOne(state, {
					id: channelId,
					changes: {
						count_mess_unread: (entity.count_mess_unread || 0) + 1,
					},
				});
			}
		},
		setDirectLastSeenTimestamp: (state, action: PayloadAction<{ channelId: string; timestamp: number }>) => {
			const channel = state.dmMetadata.entities[action.payload.channelId];
			if (channel) {
				channel.lastSeenTimestamp = action.payload.timestamp;
				channel.notifiCount = 0;
				directAdapter.updateOne(state, {
					id: action.payload.channelId,
					changes: {
						count_mess_unread: 0,
					},
				});
				const status = getStatusUnread(action.payload.timestamp, channel.lastSentTimestamp);
				state.statusDMChannelUnread[action.payload.channelId] = status;
			}
		},
		setNotifiDirectCount: (state, action: PayloadAction<{ channelId: string; notifiCount: number }>) => {
			const { channelId, notifiCount } = action.payload;
			const channel = state.dmMetadata.entities[channelId];
			if (channel) {
				channel.notifiCount = notifiCount;
			}
		},
		removeByDirectID: (state, action: PayloadAction<string>) => {
			directAdapter.removeOne(state, action.payload);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchDirectMessage.pending, (state: DirectState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchDirectMessage.fulfilled, (state: DirectState, action: PayloadAction<IChannel[]>) => {
				directAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchDirectMessage.rejected, (state: DirectState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

export const directReducer = directSlice.reducer;

export const directActions = {
	...directSlice.actions,
	fetchDirectMessage,
	createNewDirectMessage,
	joinDirectMessage,
	closeDirectMessage,
	openDirectMessage,
};

const getStatusUnread = (lastSeenStamp: number, lastSentStamp: number) => {
	if (lastSeenStamp && lastSentStamp) {
		return Number(lastSeenStamp) < Number(lastSentStamp);
	}
	return true;
};

const { selectAll, selectEntities } = directAdapter.getSelectors();

export const getDirectState = (rootState: { [DIRECT_FEATURE_KEY]: DirectState }): DirectState => rootState[DIRECT_FEATURE_KEY];
export const selectDirectMessageEntities = createSelector(getDirectState, selectEntities);

export const selectAllDirectMessages = createSelector(getDirectState, selectAll);
export const selectDmGroupCurrentId = createSelector(getDirectState, (state) => state.currentDirectMessageId);

export const selectDmGroupCurrentType = createSelector(getDirectState, (state) => state.currentDirectMessageType);

export const selectUserIdCurrentDm = createSelector(selectAllDirectMessages, selectDmGroupCurrentId,
	(directMessages, currentId) => {
		const currentDm = directMessages.find((dm) => dm.id === currentId);
		return currentDm?.user_id || [];
	}
)

export const selectIsLoadDMData = createSelector(getDirectState, (state) => state.loadingStatus !== 'not loaded');

export const selectDmGroupCurrent = (dmId: string) => createSelector(selectDirectMessageEntities, (channelEntities) => channelEntities[dmId]);

export const selectIsUnreadDMById = (channelId: string) =>
	createSelector(getDirectState, (state) => {
		const channel = state.dmMetadata.entities[channelId];
		return channel?.lastSeenTimestamp < channel?.lastSentTimestamp;
	});

export const selectLastDMTimestamp = (channelId: string) =>
	createSelector(getDirectState, (state) => {
		const channel = state.dmMetadata.entities[channelId];
		return channel?.lastSeenTimestamp || 0;
	});

export const selectDirectsUnreadlist = createSelector(selectAllDirectMessages, getDirectState, (directMessages, state) => {
	return directMessages.filter((dm) => {
		const channel = state.dmMetadata.entities[dm.id];
		return channel ? channel.lastSeenTimestamp < channel.lastSentTimestamp : false;
	});
});

export const selectListDMUnread = createSelector(selectAllDirectMessages, getDirectState, (directMessages, state) => {
	return directMessages.filter((dm) => {
		return state.statusDMChannelUnread[dm.channel_id ?? ''];
	});
});

export const selectListStatusDM = createSelector(getDirectState, (state) => state.statusDMChannelUnread);

export const selectDirectsOpenlist = createSelector(selectAllDirectMessages, (directMessages) => {
	return directMessages.filter((dm) => {
		return dm?.active === 1;
	});
});

export const selectDirectById = (id: string) => createSelector(selectDirectMessageEntities, (clansEntities) => clansEntities[id]);
