import {
	allLastSeenStampChannels,
	notificationActions,
	selectAllNotification,
	selectLastSeenTimeStampByChannelId,
	selectMessageNotified,
	selectSpecificNotifications,
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

	const getSpecificNotifications = useSelector(selectSpecificNotifications);
	console.log('getSpecificNotifications: ', getSpecificNotifications);
	const allChannelStamp = useSelector(allLastSeenStampChannels);
	console.log('allChannelStamp: ', allChannelStamp);
	const getLastSeenTimeStamp = useSelector(selectLastSeenTimeStampByChannelId(channelId ?? ''));
	const lastSeenTime = getLastSeenTimeStamp ?? 0;
	const filteredNotificationsByChannelId = getSpecificNotifications.filter((notification) => {
		if (!notification.create_time) return false;
		if (notification.content.channel_id !== channelId) return false;
		const createTime = new Date(notification.create_time).getTime() / 1000;
		return createTime > lastSeenTime;
	});

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
