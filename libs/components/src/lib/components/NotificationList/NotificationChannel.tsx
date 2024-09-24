import { useAppParams, useNotification } from '@mezon/core';
import { useAppDispatch } from '@mezon/store';
import { INotification, TNotificationChannel } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import NotificationChannelHeader from './NotificationChannelHeader';
import NotifyMentionItem from './NotifyMentionItem';

type NotificationChannelProps = {
	unreadListConverted: any[];
	isUnreadTab?: boolean;
	notification?: INotification;
};

const NotificationChannel = ({ unreadListConverted, isUnreadTab, notification }: NotificationChannelProps) => {
	const dispatch = useAppDispatch();
	const { deleteNotify } = useNotification();
	const { clanId } = useAppParams();

	const groupedUnread = useMemo(() => {
		return unreadListConverted.reduce((acc: Record<string, TNotificationChannel>, unreadNotification) => {
			if (!acc[unreadNotification?.content?.channel_id]) {
				acc[unreadNotification?.content?.channel_id] = {
					channel_id: unreadNotification?.content?.channel_id,
					channel_label: unreadNotification?.content?.channel_label,
					clan_logo: unreadNotification?.content?.clan_logo,
					clan_name: unreadNotification?.content?.clan_name,
					clan_id: unreadNotification?.content?.clan_id,
					category_name: unreadNotification?.content?.category_name,
					notifications: []
				};
			}

			acc[unreadNotification?.content?.channel_id].notifications.push(unreadNotification);

			return acc;
		}, {});
	}, [unreadListConverted]);

	const groupedUnreadArray = Object.values(groupedUnread);

	const handleMarkAsRead = useCallback(
		(itemUnread: TNotificationChannel) => {
			const ids = itemUnread.notifications.map((notification) => notification.id);
			// dispatch(notificationActions.setReadNotiStatus(ids));
			// dispatch(notificationActions.setStatusNoti());
		},
		[dispatch]
	);

	const handleDeleteNotification = useCallback(
		(notification: INotification) => {
			// dispatch(notificationActions.setReadNotiStatus([notification.id]));
			deleteNotify(notification.id, clanId ?? '0');
		},
		[clanId, deleteNotify, dispatch]
	);

	return (
		<>
			{groupedUnreadArray.length > 0 &&
				groupedUnreadArray.map((itemUnread, index) => (
					<div key={itemUnread.channel_id} className="flex flex-col gap-2 py-3 px-3 w-full">
						<NotificationChannelHeader
							onMarkAsRead={() => handleMarkAsRead(itemUnread)}
							isUnreadTab={isUnreadTab}
							itemUnread={itemUnread}
							clan_id={itemUnread.clan_id}
						/>
						{itemUnread.notifications.map((notification) => (
							<NotifyMentionItem isUnreadTab={false} notify={notification} key={`mention-${notification.id}-${index}`} />
						))}
					</div>
				))}

			{notification && (
				<div key={notification.content.channel_id} className="flex flex-col gap-2 py-3 px-3 w-full">
					<NotificationChannelHeader
						isUnreadTab={isUnreadTab}
						notification={notification}
						clan_id={notification.content.clan_id}
						onDeleteNotification={() => handleDeleteNotification(notification)}
					/>
					<NotifyMentionItem isUnreadTab={false} notify={notification} key={notification.id} />
				</div>
			)}
		</>
	);
};

export default NotificationChannel;
