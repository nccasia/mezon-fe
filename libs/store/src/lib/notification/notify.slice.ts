import { INotification, LoadingStatus, NotificationCode, NotificationEntity } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import memoizee from 'memoizee';
import { Notification } from 'mezon-js';
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
	isMessageRead: boolean;
	newNotificationStatus: boolean;
	quantityNotifyChannels: Record<string, number>;
	quantityNotifyClans: Record<string, number>;
	lastSeenTimeStampChannels: Record<string, number>;
	isShowInbox: boolean;
	specificNotifications: NotificationEntity[];
}

export type QuantityNotifyChannelArgs = {
	channelId: string;
	quantityNotify: number;
};
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
	isMessageRead: false,
	newNotificationStatus: false,
	quantityNotifyChannels: {},
	lastSeenTimeStampChannels: {},
	quantityNotifyClans: {},
	isShowInbox: false,
	specificNotifications: []
});

export const notificationSlice = createSlice({
	name: NOTIFICATION_FEATURE_KEY,
	initialState: initialNotificationState,
	reducers: {
		add(state, action) {
			const newState = notificationAdapter.addOne(state, action.payload);
			if (newState.lastSeenTimeStampChannels[action.payload.channel_id]) {
				const quantityNotify = countNotifyByChannelId(
					newState,
					action.payload.channel_id,
					newState.lastSeenTimeStampChannels[action.payload.channel_id]
				);
				const quantityNotifyClan = countNotifyByClanId(newState, action.payload.clan_id);
				state.quantityNotifyChannels[action.payload.channel_id] = quantityNotify;
				state.quantityNotifyClans[action.payload.clan_id] = quantityNotifyClan;
			}
			if (action.payload.code === NotificationCode.USER_MENTIONED || action.payload.code === NotificationCode.USER_REPLIED) {
				state.specificNotifications.push(action.payload);
			}
		},
		remove: notificationAdapter.removeOne,
		setMessageNotifiedId(state, action) {
			state.messageNotifiedId = action.payload;
		},
		setIsMessageRead(state, action) {
			state.isMessageRead = action.payload;
		},

		removeNotificationsByChannelId: (state, action: PayloadAction<string>) => {
			const channelId = action.payload;
			const remainingNotifications = state.specificNotifications
				? Object.values(state.specificNotifications).filter((notification) => notification?.content?.channel_id !== channelId)
				: [];
			state.specificNotifications = remainingNotifications;
		},

		setNotiListUnread(state, action) {
			const storedIds = localStorage.getItem('notiUnread');
			const ids = storedIds ? JSON.parse(storedIds) : [];
			ids.push(action.payload.id);
			localStorage.setItem('notiUnread', JSON.stringify(ids));
		},

		setStatusNoti(state) {
			const ids = localStorage.getItem('notiUnread');
			state.newNotificationStatus = !state.newNotificationStatus;
		},
		setAllLastSeenTimeStampChannel: (state, action: PayloadAction<LastSeenTimeStampChannelArgs[]>) => {
			for (const i of action.payload) {
				state.lastSeenTimeStampChannels[i.channelId] = i.lastSeenTimeStamp;
				const countBadgeNotifyChannel = countNotifyByChannelId(state, i.channelId, i.lastSeenTimeStamp);
				state.quantityNotifyChannels[i.channelId] = countBadgeNotifyChannel;
				const quantityNotifyClan = countNotifyByClanId(state, i.clanId);
				state.quantityNotifyClans[i.clanId] = quantityNotifyClan;
			}
		},
		setLastSeenTimeStampChannel: (state, action: PayloadAction<LastSeenTimeStampChannelArgs>) => {
			state.lastSeenTimeStampChannels[action.payload.channelId] = action.payload.lastSeenTimeStamp;
			const quantityNotify = countNotifyByChannelId(state, action.payload.channelId, action.payload.lastSeenTimeStamp);
			state.quantityNotifyChannels[action.payload.channelId] = quantityNotify;
			const quantityNotifyClan = countNotifyByClanId(state, action.payload.clanId);
			state.quantityNotifyClans[action.payload.clanId] = quantityNotifyClan;
		},
		setReadNotiStatus(state, action: PayloadAction<string[]>) {
			const storedIds = localStorage.getItem('notiUnread');
			const ids = storedIds ? JSON.parse(storedIds) : [];

			if (ids && ids?.length > 0) {
				const updatedIdsList = ids.filter((id: string) => !action.payload.includes(id));
				localStorage.setItem('notiUnread', JSON.stringify(updatedIdsList));
			} else {
				console.log('No unread notification');
			}
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
					notificationAdapter.setAll(state, action.payload);
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

const countNotifyByChannelId = (state: NotificationState, channelId: string, after = 0) => {
	const listNotifies = Object.values(state.entities);
	const listNotifiesMention = listNotifies.filter(
		(notify: INotification) => notify.code === NotificationCode.USER_MENTIONED || notify.code === NotificationCode.USER_REPLIED
	);
	const quantityNotify = listNotifiesMention.filter(
		(notification) => notification?.content?.channel_id === channelId && notification?.content?.update_time?.seconds > after
	).length;
	return quantityNotify;
};

const countNotifyByClanId = (state: NotificationState, clanId: string) => {
	const listNotifies = Object.values(state.entities);
	let countClanNotify = 0;
	listNotifies.forEach((notify) => {
		if ((notify.code === NotificationCode.USER_MENTIONED || notify.code === NotificationCode.USER_REPLIED) && notify.content.clan_id === clanId) {
			const lastTimeStamp = state.lastSeenTimeStampChannels[notify.content.channel_id];
			if (lastTimeStamp) {
				const quantityNotify = notify?.content?.update_time?.seconds > lastTimeStamp ? 1 : 0;
				countClanNotify = countClanNotify + quantityNotify;
			}
		}
	});
	return countClanNotify;
};

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
export const selectNotificationByCode = (code: number) =>
	createSelector(selectAllNotification, (notifications) => notifications.filter((notification) => notification.code === code));

export const selectNotificationMentions = createSelector(selectAllNotification, (notifications) =>
	notifications.filter(
		(notification) => notification.code === NotificationCode.USER_MENTIONED || notification.code === NotificationCode.USER_REPLIED
	)
);
export const selectNotificationMentionsByChannelId = (channelId: string, after = 0) =>
	createSelector(selectNotificationMentions, (notifications) =>
		notifications.filter((notification) => notification?.content?.channel_id === channelId && notification?.content?.update_time?.seconds > after)
	);

export const selectNotificationMentionCountByChannelId = (channelId: string, after = 0) =>
	createSelector(
		selectNotificationMentions,
		(notifications) =>
			notifications.filter(
				(notification) => notification?.content?.channel_id === channelId && notification?.content?.update_time?.seconds > after
			).length
	);

export const selectNotificationMessages = createSelector(selectAllNotification, (notifications) => {
	return notifications.filter((notification) => notification.code !== -2 && notification.code !== -3);
});

export const selectMessageNotified = createSelector(getNotificationState, (state: NotificationState) => state.messageNotifiedId);

export const selectIsMessageRead = createSelector(getNotificationState, (state: NotificationState) => state.isMessageRead);

export const selectNewNotificationStatus = createSelector(getNotificationState, (state: NotificationState) => state.newNotificationStatus);

export const selectIsShowInbox = createSelector(getNotificationState, (state: NotificationState) => state.isShowInbox);

export const selectCountNotifyByChannelId = (channelId: string) =>
	createSelector(getNotificationState, (state) => {
		return state.quantityNotifyChannels[channelId] || 0;
	});

export const selectCountNotifyByClanId = (clanId: string) =>
	createSelector(getNotificationState, (state) => {
		return state.quantityNotifyClans[clanId] || 0;
	});

export const selectTotalClansNotify = createSelector(getNotificationState, (state) => {
	return Object.values(state.quantityNotifyClans).reduce((totalNotifyCount, notifyCount) => totalNotifyCount + notifyCount, 0);
});

export const selectSpecificNotifications = createSelector(getNotificationState, (state: NotificationState) => state.specificNotifications);

export const selectCountByChannelId = (channelId: string) =>
	createSelector(
		selectSpecificNotifications,
		(notifications) => notifications.filter((notification) => notification.content.channel_id === channelId).length
	);
