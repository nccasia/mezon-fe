import { INotification, LoadingStatus, NotificationCode, NotificationEntity } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import memoizee from 'memoizee';
import { Notification } from 'mezon-js';
import { ChannelMetaEntity } from '../channels/channelmeta.slice';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';
export const NOTIFICATION_FEATURE_KEY = 'notification';
const LIST_STICKER_CACHED_TIME = 1000 * 60 * 3;

export const mapNotificationToEntity = (notifyRes: Notification): INotification => {
	return { ...notifyRes, id: notifyRes.id || '', content: notifyRes.content ? { ...notifyRes.content, create_time: notifyRes.create_time } : null };
};

export interface FetchNotificationArgs {
	clanId: string;
	noCache?: boolean;
}

export interface NotificationState extends EntityState<NotificationEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	messageNotifiedId: string;
	isShowInbox: boolean;
}

export type LastSeenTimeStampChannelArgs = {
	channelId: string;
	lastSeenTimeStamp: number;
	clanId: string;
};

export const notificationAdapter = createEntityAdapter<NotificationEntity>();

const fetchListNotificationCached = memoizee(
	async (mezon: MezonValueContext, clanId: string) => {
		const response = await mezon.client.listNotifications(mezon.session, clanId, 50);
		return { ...response, time: Date.now() };
	},
	{
		promise: true,
		maxAge: LIST_STICKER_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[0].session.username;
		}
	}
);

export const fetchListNotification = createAsyncThunk(
	'notification/fetchListNotification',
	async ({ clanId, noCache }: FetchNotificationArgs, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		if (noCache) {
			fetchListNotificationCached.clear(mezon, clanId);
		}
		const response = await fetchListNotificationCached(mezon, clanId);
		if (!response.notifications) {
			return [];
		}
		if (Date.now() - response.time < 100) {
			const notifications = response.notifications.map(mapNotificationToEntity);
			return notifications;
		}
		return null;
	}
);

export const deleteNotify = createAsyncThunk('notification/deleteNotify', async ({ ids, clanId }: { ids: string[]; clanId: string }, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.deleteNotifications(mezon.session, ids);
	if (!response) {
		return thunkAPI.rejectWithValue([]);
	}
	thunkAPI.dispatch(notificationActions.fetchListNotification({ clanId, noCache: true }));
	return response;
});

export const initialNotificationState: NotificationState = notificationAdapter.getInitialState({
	loadingStatus: 'not loaded',
	notificationMentions: [],
	error: null,
	messageNotifiedId: '',
	quantityNotifyChannels: {},
	lastSeenTimeStampChannels: {},
	quantityNotifyClans: {},
	isShowInbox: false
});

export const notificationSlice = createSlice({
	name: NOTIFICATION_FEATURE_KEY,
	initialState: initialNotificationState,
	reducers: {
		add(state, action) {
			notificationAdapter.addOne(state, action.payload);
		},

		remove: notificationAdapter.removeOne,
		setMessageNotifiedId(state, action) {
			state.messageNotifiedId = action.payload;
		},

		setIsShowInbox(state, action: PayloadAction<boolean>) {
			state.isShowInbox = action.payload;
		}
	},

	extraReducers: (builder) => {
		builder
			.addCase(fetchListNotification.pending, (state: NotificationState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchListNotification.fulfilled, (state: NotificationState, action: PayloadAction<INotification[] | null>) => {
				if (action.payload !== null) {
					notificationAdapter.addMany(state, action.payload);
					state.loadingStatus = 'loaded';
				} else {
					state.loadingStatus = 'not loaded';
				}
			})
			.addCase(fetchListNotification.rejected, (state: NotificationState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const notificationReducer = notificationSlice.reducer;

export const notificationActions = {
	...notificationSlice.actions,
	fetchListNotification,
	deleteNotify
};

const { selectAll, selectEntities } = notificationAdapter.getSelectors();

export const getNotificationState = (rootState: { [NOTIFICATION_FEATURE_KEY]: NotificationState }): NotificationState =>
	rootState[NOTIFICATION_FEATURE_KEY];

export const selectAllNotification = createSelector(getNotificationState, selectAll);

export const selectNotificationEntities = createSelector(getNotificationState, selectEntities);

export const selectNotificationMentions = createSelector(selectAllNotification, (notifications) =>
	notifications.filter(
		(notification) => notification.code === NotificationCode.USER_MENTIONED || notification.code === NotificationCode.USER_REPLIED
	)
);

export const selectNotificationMessages = createSelector(selectAllNotification, (notifications) => {
	return notifications.filter((notification) => notification.code !== -2 && notification.code !== -3);
});

export const selectMessageNotified = createSelector(getNotificationState, (state: NotificationState) => state.messageNotifiedId);

export const selectIsShowInbox = createSelector(getNotificationState, (state: NotificationState) => state.isShowInbox);

/////////////// New update ///////////////
export const selectAllNotificationExcludeMentionAndReply = createSelector(selectAllNotification, (notifications) =>
	notifications.filter(
		(notification) => notification.code !== NotificationCode.USER_REPLIED && notification.code !== NotificationCode.USER_MENTIONED
	)
);
export const selectAllNotificationMentionAndReply = createSelector(selectAllNotification, (notifications) =>
	notifications.filter(
		(notification) => notification.code === NotificationCode.USER_REPLIED || notification.code === NotificationCode.USER_MENTIONED
	)
);

export const selectMentionAndReplyByClanId = (clanId: string) =>
	createSelector(selectAllNotification, (notifications) =>
		notifications.filter(
			(notification) =>
				notification.content.clan_id === clanId &&
				(notification.code === NotificationCode.USER_REPLIED || notification.code === NotificationCode.USER_MENTIONED)
		)
	);

export const selectMentionAndReplyUnreadByChanneld = (clanId: string, channelId: string, lastSeenStamp: number) =>
	createSelector(selectAllNotification, (notifications) => {
		const clanFilteredNotifications = notifications.filter((notification) => notification.content.clan_id === clanId);

		const filteredNotifications = clanFilteredNotifications.filter(
			(notification) => notification.code === NotificationCode.USER_REPLIED || notification.code === NotificationCode.USER_MENTIONED
		);

		return filteredNotifications.filter((notification) => {
			if (!notification.create_time || !lastSeenStamp) {
				return false;
			}

			const timeCreate = new Date(notification.create_time).getTime() / 1000;
			return notification.content.channel_id === channelId && Math.floor(lastSeenStamp) < timeCreate;
		});
	});

export const selectMentionAndReplyUnreadByClanId = (clanId: string, listLastSeen: ChannelMetaEntity[]) =>
	createSelector(selectAllNotification, (notifications) => {
		const filteredNotifications = notifications.filter(
			(notification) =>
				notification.content.clan_id === clanId &&
				(notification.code === NotificationCode.USER_REPLIED || notification.code === NotificationCode.USER_MENTIONED)
		);
		const lastSeenMap = new Map<string, number>();
		listLastSeen.forEach((channel) => {
			lastSeenMap.set(channel.id, channel.lastSeenTimestamp ?? 0);
		});

		return filteredNotifications.filter((notification) => {
			if (!notification.create_time) {
				return false;
			}

			const notificationTimestamp = new Date(notification.create_time).getTime() / 1000;
			const channelId = notification.content.channel_id;

			const lastSeen = lastSeenMap.get(channelId) ?? 0;

			return lastSeen > 0 && notificationTimestamp > lastSeen;
		});
	});
export const selectMentionAndReplyUnreadAllClan = (listLastSeenAllClan: ChannelMetaEntity[]) =>
	createSelector(selectAllNotification, (notifications) => {
		const filteredNotifications = notifications.filter(
			(notification) => notification.code === NotificationCode.USER_REPLIED || notification.code === NotificationCode.USER_MENTIONED
		);
		const lastSeenMap = new Map<string, number>();
		listLastSeenAllClan.forEach((channel) => {
			lastSeenMap.set(channel.id, channel.lastSeenTimestamp ?? 0);
		});

		return filteredNotifications.filter((notification) => {
			if (!notification.create_time) {
				return false;
			}

			const notificationTimestamp = new Date(notification.create_time).getTime() / 1000;
			const channelId = notification.content.channel_id;

			const lastSeen = lastSeenMap.get(channelId) ?? 0;

			return lastSeen > 0 && notificationTimestamp > lastSeen;
		});
	});
