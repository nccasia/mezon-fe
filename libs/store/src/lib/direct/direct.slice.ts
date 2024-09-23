import { ActiveDm, IChannel, LoadingStatus } from '@mezon/utils';
import { EntityState, GetThunkAPI, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ChannelType } from 'mezon-js';
import { ApiChannelDescription, ApiCreateChannelDescRequest, ApiDeleteChannelDescRequest } from 'mezon-js/api.gen';
import { channelMembersActions } from '../channelmembers/channel.members';
import { channelsActions, fetchChannelsCached } from '../channels/channels.slice';
import { hashtagDmActions } from '../channels/hashtagDm.slice';
import { ensureSession, getMezonCtx } from '../helpers';
import { messagesActions } from '../messages/messages.slice';
import { pinMessageActions } from '../pinMessages/pinMessage.slice';
import { directMetaActions, selectEntitiesDirectMeta } from './directmeta.slice';

export const DIRECT_FEATURE_KEY = 'direct';

export interface DirectEntity extends IChannel {
	id: string;
}

export interface DirectState extends EntityState<DirectEntity, string> {
	loadingStatus: LoadingStatus;
	socketStatus: LoadingStatus;
	error?: string | null;
	currentDirectMessageId?: string | null;
	currentDirectMessageType?: number;
	statusDMChannelUnread: Record<string, boolean>;
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
						parentId: '0',
						channelId: response.channel_id as string,
						channelType: response.type as number,
						isPublic: false,
						isParentPublic: false
					})
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
			const state = getDirectRootState(thunkAPI);
			const dmChannel = selectDirectById(state, channelId) || {};
			if (dmChannel?.active !== ActiveDm.OPEN_DM && clanId === '0') {
				await mezon.client.openDirectMess(mezon.session, { channel_id: channelId });
			}
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
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
					Number(channel.last_sent_message?.timestamp_seconds)
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
		thunkAPI.dispatch(directMetaActions.setDirectMetaEntities(channels));
		return channels;
	}
);

interface JoinDirectMessagePayload {
	directMessageId: string;
	channelName?: string;
	type?: number;
	noCache?: boolean;
	isFetchingLatestMessages?: boolean;
	isClearMessage?: boolean;
}
interface members {
	user_id?: string;
}

export type StatusDMUnreadArgs = {
	dmId: string;
	isUnread: boolean;
};

export const joinDirectMessage = createAsyncThunk<void, JoinDirectMessagePayload>(
	'direct/joinDirectMessage',
	async ({ directMessageId, type, noCache = false, isFetchingLatestMessages = false, isClearMessage = false }, thunkAPI) => {
		try {
			thunkAPI.dispatch(directActions.setDmGroupCurrentId(directMessageId));
			thunkAPI.dispatch(directActions.setDmGroupCurrentType(type ?? ChannelType.CHANNEL_TYPE_DM));
			thunkAPI.dispatch(messagesActions.fetchMessages({ channelId: directMessageId, noCache, isFetchingLatestMessages, isClearMessage }));
			const fetchChannelMembersResult = await thunkAPI.dispatch(
				channelMembersActions.fetchChannelMembers({
					clanId: '',
					channelId: directMessageId,
					channelType: ChannelType.CHANNEL_TYPE_TEXT,
					noCache
				})
			);
			const members = fetchChannelMembersResult.payload as members[];
			if (type === ChannelType.CHANNEL_TYPE_DM && members && members.length > 0) {
				const userIds = members.map((member) => member?.user_id as string);
				thunkAPI.dispatch(hashtagDmActions.fetchHashtagDm({ userIds: userIds, directId: directMessageId }));
			}
			thunkAPI.dispatch(pinMessageActions.fetchChannelPinMessages({ channelId: directMessageId }));
		} catch (error) {
			console.log(error);
			return thunkAPI.rejectWithValue([]);
		}
	}
);

export const initialDirectState: DirectState = directAdapter.getInitialState({
	loadingStatus: 'not loaded',
	socketStatus: 'not loaded',
	error: null,
	statusDMChannelUnread: {}
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
		setAllStatusDMUnread: (state, action: PayloadAction<StatusDMUnreadArgs[]>) => {
			for (const i of action.payload) {
				state.statusDMChannelUnread[i.dmId] = i.isUnread;
			}
		},
		removeByDirectID: (state, action: PayloadAction<string>) => {
			directAdapter.removeOne(state, action.payload);
		}
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
	}
});

export const directReducer = directSlice.reducer;

export const directActions = {
	...directSlice.actions,
	fetchDirectMessage,
	createNewDirectMessage,
	joinDirectMessage,
	closeDirectMessage,
	openDirectMessage
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

export const selectUserIdCurrentDm = createSelector(selectAllDirectMessages, selectDmGroupCurrentId, (directMessages, currentId) => {
	const currentDm = directMessages.find((dm) => dm.id === currentId);
	return currentDm?.user_id || [];
});

export const selectIsLoadDMData = createSelector(getDirectState, (state) => state.loadingStatus !== 'not loaded');

export const selectDmGroupCurrent = (dmId: string) => createSelector(selectDirectMessageEntities, (channelEntities) => channelEntities[dmId]);

export const selectListDMUnread = createSelector(selectAllDirectMessages, getDirectState, (directMessages, state) => {
	return directMessages.filter((dm) => {
		return state.statusDMChannelUnread[dm.channel_id ?? ''];
	});
});

export const selectListStatusDM = createSelector(getDirectState, (state) => state.statusDMChannelUnread);

export const selectDirectsOpenlist = createSelector(selectAllDirectMessages, selectEntitiesDirectMeta, (directMessages, directMetaEntities) => {
	return directMessages
		.filter((dm) => {
			return dm?.active === 1;
		})
		.map((dm) => {
			if (!dm?.channel_id) return dm;
			const found = directMetaEntities?.[dm.channel_id];
			return {
				...dm,
				last_sent_message: { ...dm.last_sent_message, ...found.last_sent_message },
				last_seen_message: { ...dm.last_seen_message, ...found.last_seen_message }
			};
		});
});

export const selectDirectById = createSelector([selectDirectMessageEntities, (state, id) => id], (clansEntities, id) => clansEntities?.[id]);
