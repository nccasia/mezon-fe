import {
	notificationActions,
	selectAllNotification,
	selectLastSeenTimeStampByChannelId,
	selectMessageByMessageId,
	selectMessageNotified,
	selectSpecificNotifications,
	selectUnreadMessageIdByChannelId,
	useAppDispatch
} from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useNotification(channelId = '', clanId = '') {
	const dispatch = useAppDispatch();
	const notification = useSelector(selectAllNotification);
	const idMessageNotified = useSelector(selectMessageNotified);

	const deleteNotify = useCallback(
		(id: string, clanId: string) => {
			const ids = [id];
			dispatch(notificationActions.deleteNotify({ ids, clanId }));
		},
		[dispatch]
	);

	const setMessageNotifiedId = useCallback(
		(idMessageNotified: string) => {
			dispatch(notificationActions.setMessageNotifiedId(idMessageNotified));
		},
		[dispatch]
	);

	const getMessageIdUnread = useSelector(selectUnreadMessageIdByChannelId(channelId));
	const getMessageUnread = useSelector(selectMessageByMessageId(getMessageIdUnread ?? ''));

	console.log('getMessageUnread: ', getMessageUnread);

	const getSpecificNotifications = useSelector(selectSpecificNotifications);

	const getLastSeenTimeStamp = useSelector(selectLastSeenTimeStampByChannelId(channelId ?? ''));
	const lastSeenTime = getLastSeenTimeStamp ?? 0;
	const filteredNotificationsByChannelId = getSpecificNotifications.filter((notification) => {
		if (!notification.create_time) return false;
		if (notification.content.channel_id !== channelId) return false;
		const createTime = new Date(notification.create_time).getTime() / 1000;
		return createTime > lastSeenTime;
	});
	// useEffect(() => {
	// 	console.log('filteredNotificationsByChannelId: ', filteredNotificationsByChannelId);

	// 	if (filteredNotificationsByChannelId.length > 0) {
	// 		dispatch(
	// 			notificationActions.setCountByClan({
	// 				channelId: channelId,
	// 				clanId: filteredNotificationsByChannelId[0].content.clan_id ?? '',
	// 				notiUnread: filteredNotificationsByChannelId
	// 			})
	// 		);
	// 	}
	// }, [filteredNotificationsByChannelId]);

	return useMemo(
		() => ({
			notification,
			deleteNotify,
			setMessageNotifiedId,
			idMessageNotified,
			filteredNotificationsByChannelId
		}),
		[notification, deleteNotify, setMessageNotifiedId, idMessageNotified, filteredNotificationsByChannelId]
	);
}
