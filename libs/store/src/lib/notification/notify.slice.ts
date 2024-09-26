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
	lastSeenTimeStampChannels: Record<string, LastSeenTimeStampChannelArgs>;
	isShowInbox: boolean;
	specificNotifications: NotificationEntity[];
	lastSeenTimeStampClans: Record<string, LastSeenTimeStampChannelArgs>;

	countByClan: Record<string, CountByClanArgs>;
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

export type CountByClanArgs = {
	channelId: string;
	notiUnread: any;
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
	specificNotifications: [],
	lastSeenTimeStampClans: {},
	countByClan: {}
});

export const notificationSlice = createSlice({
	name: NOTIFICATION_FEATURE_KEY,
	initialState: initialNotificationState,
	reducers: {
		add(state, action) {
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
			Object.keys(state.countByClan).forEach((clanId) => {
				const clanData = state.countByClan[clanId];
				const filteredNotiUnread = clanData.notiUnread?.filter((noti: any) => noti.content.channel_id !== channelId);
				if (filteredNotiUnread?.length !== clanData?.notiUnread?.length) {
					state.countByClan[clanId].notiUnread = filteredNotiUnread;
				}
			});
		},

		removeAllNotificattionChannel: (state) => {
			state.specificNotifications = [];
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
				// state.lastSeenTimeStampChannels[i.channelId] = i.lastSeenTimeStamp;
				const countBadgeNotifyChannel = countNotifyByChannelId(state, i.channelId, i.lastSeenTimeStamp);
				state.quantityNotifyChannels[i.channelId] = countBadgeNotifyChannel;
				const quantityNotifyClan = countNotifyByClanId(state, i.clanId);
				state.quantityNotifyClans[i.clanId] = quantityNotifyClan;
			}
		},

		setLastSeenTimeStampChannel: (state, action: PayloadAction<LastSeenTimeStampChannelArgs>) => {
			const { channelId, lastSeenTimeStamp, clanId } = action.payload;

			// Update the last seen timestamp for the channel
			if (state.lastSeenTimeStampChannels[channelId]) {
				// If it exists, update the lastSeenTimeStamp property
				state.lastSeenTimeStampChannels[channelId] = {
					...state.lastSeenTimeStampChannels[channelId], // Spread existing properties
					lastSeenTimeStamp // Update lastSeenTimeStamp
				};
			} else {
				// If it does not exist, create a new entry
				state.lastSeenTimeStampChannels[channelId] = {
					channelId, // Set channelId
					lastSeenTimeStamp, // Set lastSeenTimeStamp
					clanId // Set clanId
				};
			}
		},

		setCountByClan: (state, action: PayloadAction<CountByClanArgs>) => {
			const { channelId, notiUnread, clanId } = action.payload;
			console.log('channelId, notiUnread, clanId: ', channelId, notiUnread, clanId);
			const uniqueNotiUnread = notiUnread.filter(
				(noti: any, index: number, self: any) => index === self.findIndex((n: any) => n.id === noti.id)
			);

			if (state.countByClan[clanId]) {
				const existingNotiUnread = state.countByClan[clanId].notiUnread || [];
				const mergedNotiUnread = [...existingNotiUnread, ...uniqueNotiUnread].filter(
					(noti, index, self) => index === self.findIndex((n) => n.id === noti.id)
				);

				state.countByClan[clanId].notiUnread = mergedNotiUnread;
			} else {
				state.countByClan[clanId] = {
					channelId,
					notiUnread: uniqueNotiUnread,
					clanId
				};
			}

			console.log('Updated countByClan:', state.countByClan);
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
					state.specificNotifications = action.payload.filter(
						({ code }) => code === NotificationCode.USER_REPLIED || code === NotificationCode.USER_MENTIONED
					);
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

export const selectSpecificNotifications = createSelector(getNotificationState, (state: NotificationState) => state.specificNotifications);

export const selectNotificationEntities = createSelector(getNotificationState, selectEntities);
export const selectNotificationByCode = (code: number) =>
	createSelector(selectAllNotification, (notifications) => notifications.filter((notification) => notification.code === code));

export const selectNotificationMessages = createSelector(selectAllNotification, (notifications) => {
	return notifications.filter((notification) => notification.code !== -2 && notification.code !== -3);
});

export const selectMessageNotified = createSelector(getNotificationState, (state: NotificationState) => state.messageNotifiedId);

export const selectIsMessageRead = createSelector(getNotificationState, (state: NotificationState) => state.isMessageRead);

export const selectNewNotificationStatus = createSelector(getNotificationState, (state: NotificationState) => state.newNotificationStatus);

export const selectIsShowInbox = createSelector(getNotificationState, (state: NotificationState) => state.isShowInbox);

export const selectTotalClansNotify = createSelector(getNotificationState, (state) => {
	return Object.values(state.quantityNotifyClans).reduce((totalNotifyCount, notifyCount) => totalNotifyCount + notifyCount, 0);
});

export const allLastSeenStampChannels = createSelector(getNotificationState, (state: NotificationState) => {
	const channels = state.lastSeenTimeStampChannels;
	return Object.values(channels).filter((channel) => channel.channelId && channel.lastSeenTimeStamp !== undefined && channel.clanId);
});
export const selectLastSeenTimeStampByChannelId = (channelId: string) =>
	createSelector(allLastSeenStampChannels, (lastSeenTimeStampChannels) => {
		if (!lastSeenTimeStampChannels) {
			return null;
		}
		const channelData = lastSeenTimeStampChannels[channelId as any];
		return channelData ? channelData.lastSeenTimeStamp : null;
	});

export const selectAllCountByClan = createSelector(getNotificationState, (state: NotificationState) => state.countByClan);

export const selectCountByClanId = (clanId: string) => createSelector(selectAllCountByClan, (countByClan) => countByClan[clanId] || null);

export const selectFilteredNotificationsByClan = createSelector(
	[selectSpecificNotifications, allLastSeenStampChannels, (_, clanId: string) => clanId],
	(notifications, lastSeenStamps, clanId) => {
		return notifications.filter((notification) => {
			// Extract content and check if create_time is defined
			const { content } = notification;
			if (!content || !content.clan_id || content.clan_id !== clanId) return false;

			const { create_time, channel_id } = content;

			// Check if create_time is defined and convert to timestamp
			if (!create_time || !channel_id) return false;
			const notificationTimestamp = new Date(create_time).getTime() / 1000;

			// Find lastSeenTimeStamp for the corresponding channelId
			const lastSeenInfo = Object.values(lastSeenStamps).find((stamp) => stamp.channelId === channel_id);

			// If no lastSeenInfo or create_time > lastSeenTimeStamp, keep the notification
			return !lastSeenInfo || notificationTimestamp > lastSeenInfo.lastSeenTimeStamp;
		});
	}
);

// const selectSpecificNotifications = [
// 	{
// 		code: -9,
// 		create_time: '2024-09-25T15:52:42Z',
// 		id: '1838969887750361088',
// 		persistent: true,
// 		sender_id: '1784059393956909056',
// 		subject: 'namphongnguyen129(1 #general)',
// 		content: {
// 			code: {},
// 			mode: 2,
// 			clan_id: '1828730594649968640',
// 			content: '{"t":"@Nguyễn Nam Phong 123"}',
// 			mentions: '[{"user_id":"1775730015049093120","e":17}]',
// 			username: 'namphongnguyen129',
// 			clan_logo: 'https://cdn.mezon.vn/1822940699390119936/0/1788103935005823000/44froge_fight.gif',
// 			is_public: true,
// 			sender_id: '1784059393956909056',
// 			channel_id: '1828730594687717376',
// 			message_id: '1838969887746166784',
// 			references: '[]',
// 			attachments: '[]',
// 			create_time: '2024-09-25T15:52:42Z',
// 			update_time: {
// 				seconds: 1727279562
// 			},
// 			display_name: 'Nam Phong',
// 			hide_editted: true,
// 			channel_label: 'general'
// 		}
// 	},
// 	{
// 		code: -9,
// 		create_time: '2024-09-25T15:53:06Z',
// 		id: '1838969988354936832',
// 		persistent: true,
// 		sender_id: '1784059393956909056',
// 		subject: 'namphongnguyen129(1 #general)',
// 		content: {
// 			code: {},
// 			mode: 2,
// 			clan_id: '1828730594649968640',
// 			content: '{"t":"@Nguyễn Nam Phong "}',
// 			mentions: '[{"user_id":"1775730015049093120","e":17}]',
// 			username: 'namphongnguyen129',
// 			clan_logo: 'https://cdn.mezon.vn/1822940699390119936/0/1788103935005823000/44froge_fight.gif',
// 			is_public: true,
// 			sender_id: '1784059393956909056',
// 			channel_id: '1828730594687717376',
// 			message_id: '1838969988350742528',
// 			references: '[]',
// 			attachments: '[]',
// 			create_time: '2024-09-25T15:53:06Z',
// 			update_time: {
// 				seconds: 1727279586
// 			},
// 			display_name: 'Nam Phong',
// 			hide_editted: true,
// 			channel_label: 'general'
// 		}
// 	},
// 	{
// 		code: -9,
// 		create_time: '2024-09-25T15:53:44Z',
// 		id: '1838970148770287616',
// 		persistent: true,
// 		sender_id: '1784059393956909056',
// 		subject: 'namphongnguyen129(1 #general)',
// 		content: {
// 			code: {},
// 			mode: 2,
// 			clan_id: '1828730594649968640',
// 			content: '{"t":"hello @Nguyễn Nam Phong "}',
// 			mentions: '[{"user_id":"1775730015049093120","s":6,"e":23}]',
// 			username: 'namphongnguyen129',
// 			clan_logo: 'https://cdn.mezon.vn/1822940699390119936/0/1788103935005823000/44froge_fight.gif',
// 			is_public: true,
// 			sender_id: '1784059393956909056',
// 			channel_id: '1828730594687717376',
// 			message_id: '1838970148757704704',
// 			references: '[]',
// 			attachments: '[]',
// 			create_time: '2024-09-25T15:53:44Z',
// 			update_time: {
// 				seconds: 1727279624
// 			},
// 			display_name: 'Nam Phong',
// 			hide_editted: true,
// 			channel_label: 'general'
// 		}
// 	},
// 	{
// 		code: -9,
// 		create_time: '2024-09-26T04:44:44Z',
// 		id: '1839164177319464960',
// 		persistent: true,
// 		sender_id: '1784059393956909056',
// 		subject: 'namphongnguyen129(1 #general)',
// 		content: {
// 			code: {},
// 			mode: 2,
// 			clan_id: '1828730594649968640',
// 			content: '{"t":"hello @Nguyễn Nam Phong "}',
// 			mentions: '[{"user_id":"1775730015049093120","s":6,"e":23}]',
// 			username: 'namphongnguyen129',
// 			clan_logo: 'https://cdn.mezon.vn/1822940699390119936/0/1788103935005823000/44froge_fight.gif',
// 			is_public: true,
// 			sender_id: '1784059393956909056',
// 			channel_id: '1828730594687717376',
// 			message_id: '1839164177315270656',
// 			references: '[]',
// 			attachments: '[]',
// 			create_time: '2024-09-26T04:44:44Z',
// 			update_time: {
// 				seconds: 1727325884
// 			},
// 			display_name: 'Nam Phong',
// 			hide_editted: true,
// 			channel_label: 'general'
// 		}
// 	}
// ];

// const allLastSeenStampChannels = {
// 	'1775820446206267392': {
// 		channelId: '1775820446206267392',
// 		lastSeenTimeStamp: 1727316054.911,
// 		clanId: '1775732550744936448'
// 	},
// 	'1775791967452532736': {
// 		channelId: '1775791967452532736',
// 		lastSeenTimeStamp: 1727324904.228,
// 		clanId: '1775732550744936448'
// 	},
// 	'1838471988297863168': {
// 		lastSeenTimeStamp: 1727332087.381
// 	},
// 	'1832994424259350528': {
// 		channelId: '1832994424259350528',
// 		lastSeenTimeStamp: 1727327543.682,
// 		clanId: '1782714213009985536'
// 	},
// 	'1801426280726401024': {
// 		channelId: '1801426280726401024',
// 		lastSeenTimeStamp: 1727325057.851,
// 		clanId: '1775732550744936448'
// 	},
// 	'1813895345772433408': {
// 		channelId: '1813895345772433408',
// 		lastSeenTimeStamp: 1727325059.448,
// 		clanId: '1775732550744936448'
// 	},
// 	'1816492250671091712': {
// 		channelId: '1816492250671091712',
// 		lastSeenTimeStamp: 1727327532.697,
// 		clanId: '1775732550744936448'
// 	},
// 	'1816492672865538048': {
// 		channelId: '1816492672865538048',
// 		lastSeenTimeStamp: 1727331392.425,
// 		clanId: '1775732550744936448'
// 	}
// };
// viết selector truyền vào clanid, lọc theo clanid đó và lấy những notification có cùng channel nhưng create_time/1000 lớn hơn lastSeenTimeStamp
