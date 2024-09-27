import { DirectEntity, MessagesEntity } from '@mezon/store-mobile';
import { ActiveDm, IChannel, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ChannelMessage } from 'mezon-js';

export const DIRECT_META_FEATURE_KEY = 'directmeta';

export interface DirectMetaEntity extends IChannel {
	id: string;
}
interface DMMeta {
	id: string;
	lastSeenTimestamp: number;
	lastSentTimestamp: number;
	notifiCount: number;
}

const dmMetaAdapter = createEntityAdapter<DMMeta>();

export interface DirectMetaState extends EntityState<DirectMetaEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	dmMetadata: EntityState<DMMeta, string>;
}
export const directMetaAdapter = createEntityAdapter<DirectMetaEntity>();

export const initialDirectMetaState: DirectMetaState = directMetaAdapter.getInitialState({
	loadingStatus: 'not loaded',
	socketStatus: 'not loaded',
	error: null,
	dmMetadata: dmMetaAdapter.getInitialState()
});

function extractDMMeta(channel: DirectEntity): DMMeta {
	const lastSeenTimestamp = Number(channel?.last_seen_message?.timestamp_seconds);
	const lastSentTimestamp = Number(channel?.last_sent_message?.timestamp_seconds);

	return {
		id: channel.id,
		lastSeenTimestamp: isNaN(lastSeenTimestamp) ? lastSentTimestamp : lastSeenTimestamp,
		lastSentTimestamp: lastSentTimestamp,
		notifiCount: Number(channel.count_mess_unread || 0)
	};
}

export const directMetaSlice = createSlice({
	name: DIRECT_META_FEATURE_KEY,
	initialState: initialDirectMetaState,
	reducers: {
		add: directMetaAdapter.addOne,
		removeAll: directMetaAdapter.removeAll,
		remove: directMetaAdapter.removeOne,
		update: directMetaAdapter.updateOne,
		setDirectLastSentTimestamp: (state, action: PayloadAction<{ channelId: string; timestamp: number }>) => {
			const channel = state.dmMetadata.entities[action.payload.channelId];
			if (channel) {
				channel.lastSentTimestamp = action.payload.timestamp;
			}
		},
		updateDMSocket: (state, action: PayloadAction<ChannelMessage>) => {
			const payload = action.payload;
			const timestamp = Date.now() / 1000;
			const dmChannel = directMetaAdapter.getSelectors().selectById(state, payload.channel_id);

			directMetaAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: {
					last_sent_message: {
						content: payload.content,
						id: payload.id,
						sender_id: payload.sender_id,
						timestamp_seconds: timestamp
					}
				}
			});

			if (payload.clan_id === '0' && dmChannel?.active !== ActiveDm.OPEN_DM) {
				directMetaAdapter.updateOne(state, {
					id: payload.channel_id,
					changes: {
						active: ActiveDm.OPEN_DM
					}
				});
			}
		},
		setCountMessUnread: (state, action: PayloadAction<{ channelId: string }>) => {
			const { channelId } = action.payload;
			const entity = state.entities[channelId];
			if (entity) {
				directMetaAdapter.updateOne(state, {
					id: channelId,
					changes: {
						count_mess_unread: (entity.count_mess_unread || 0) + 1
					}
				});
			}
		},
		setDirectLastSeenTimestamp: (state, action: PayloadAction<{ channelId: string; timestamp: number }>) => {
			directMetaAdapter.updateOne(state, {
				id: action.payload.channelId,
				changes: {
					count_mess_unread: 0
				}
			});
		},
		updateLastSeenTime: (state, action: PayloadAction<MessagesEntity>) => {
			const payload = action.payload;
			const timestamp = Date.now() / 1000;
			directMetaAdapter.updateOne(state, {
				id: payload.channel_id,
				changes: {
					last_seen_message: {
						content: payload.content,
						id: payload.id,
						sender_id: payload.sender_id,
						timestamp_seconds: timestamp
					}
				}
			});
		},
		setDirectMetaLastSeenTimestamp: (state, action: PayloadAction<{ channelId: string; timestamp: number }>) => {
			const channel = state.dmMetadata.entities[action.payload.channelId];
			if (channel) {
				channel.lastSeenTimestamp = action.payload.timestamp;
				channel.notifiCount = 0;
			}
		},
		removeUnreadAllDm: (state) => {
			Object.values(state.dmMetadata.entities).forEach((channel) => {
				if (channel && channel.lastSeenTimestamp < channel.lastSentTimestamp) {
					channel.lastSentTimestamp = 0;
				}
			});
		},
		setDirectMetaEntities: (state, action: PayloadAction<IChannel[]>) => {
			const channels = action.payload;
			if (channels) {
				const meta = channels.map((ch) => extractDMMeta(ch));
				directMetaAdapter.setAll(state, channels);
				state.dmMetadata = dmMetaAdapter.upsertMany(state.dmMetadata, meta);
			}
		}
	}
});

export const directMetaReducer = directMetaSlice.reducer;

export const directMetaActions = {
	...directMetaSlice.actions
};
const { selectAll, selectEntities } = directMetaAdapter.getSelectors();

export const getDirectMetaState = (rootState: { [DIRECT_META_FEATURE_KEY]: DirectMetaState }): DirectMetaState => rootState[DIRECT_META_FEATURE_KEY];

export const selectAllDirectMetaMessages = createSelector(getDirectMetaState, selectAll);

export const selectEntitiesDirectMeta = createSelector(getDirectMetaState, selectEntities);

export const selectIsUnreadDMById = (channelId: string) =>
	createSelector(getDirectMetaState, (state) => {
		const channel = state.dmMetadata.entities[channelId];
		return channel?.lastSeenTimestamp < channel?.lastSentTimestamp;
	});

export const selectDirectsUnreadlist = createSelector(selectAllDirectMetaMessages, getDirectMetaState, (directMessages, state) => {
	return directMessages.filter((dm) => {
		const channel = state.dmMetadata.entities[dm.id];
		return channel ? channel.lastSeenTimestamp < channel.lastSentTimestamp : false;
	});
});

export const selectTotalUnreadDM = createSelector(selectDirectsUnreadlist, (listUnreadDM) => {
	return listUnreadDM.reduce((total, count) => total + (count.count_mess_unread ?? 0), 0);
});
