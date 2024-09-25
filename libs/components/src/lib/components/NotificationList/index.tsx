import { useNotification } from '@mezon/core';
import { directMetaActions, notificationActions, selectSpecificNotifications, selectTheme } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { INotification, NotificationCode } from '@mezon/utils';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmptyNotification from './EmptyNotification';
import NotificationChannel from './NotificationChannel';
import NotificationItem from './NotificationItem';

export type MemberListProps = { className?: string };

export type NotificationProps = {
	unReadList?: string[];
	onClose?: () => void;
};

const InboxType = {
	INDIVIDUAL: 'individual',
	UNREADS: 'unreads',
	MENTIONS: 'mentions'
};

const tabDataNotify = [
	{ title: 'For you', value: InboxType.INDIVIDUAL },
	{ title: 'Unreads', value: InboxType.UNREADS },
	{ title: 'Mentions', value: InboxType.MENTIONS }
];

function NotificationList({ unReadList, onClose }: NotificationProps) {
	const dispatch = useDispatch();

	const { notification } = useNotification();
	const [currentTabNotify, setCurrentTabNotify] = useState(InboxType.INDIVIDUAL);
	const handleChangeTab = (valueTab: string) => {
		setCurrentTabNotify(valueTab);
	};

	const replyAndMentionNotification = useSelector(selectSpecificNotifications);
	console.log('replyAndMentionNotification :', replyAndMentionNotification);

	const sortNotifications = useMemo(() => {
		return notification.sort((a, b) => {
			const dateA = new Date(a.create_time || '').getTime();
			const dateB = new Date(b.create_time || '').getTime();
			return dateB - dateA;
		});
	}, [notification]);

	const notificationItem = sortNotifications.filter(
		(item) => item.code !== NotificationCode.USER_MENTIONED && item.code !== NotificationCode.USER_REPLIED
	);
	const notifyMentionItem = sortNotifications.filter(
		(item) => item.code === NotificationCode.USER_MENTIONED || item.code === NotificationCode.USER_REPLIED
	);

	const appearanceTheme = useSelector(selectTheme);

	const unreadListConverted = useMemo(() => {
		return replyAndMentionNotification.filter((item) => unReadList?.includes(item.id));
	}, [replyAndMentionNotification]);

	console.log('unreadListConverted :', unreadListConverted);
	const handleMarkAllAsRead = useCallback(() => {
		// localStorage.setItem('notiUnread', JSON.stringify([]));
		// dispatch(notificationActions.setStatusNoti());
		// localStorage.setItem('notiUnread', JSON.stringify([]));
		dispatch(notificationActions.removeAllNotificattionChannel());
		dispatch(directMetaActions.removeUnreadAllDm());
		dispatch(notificationActions.setStatusNoti());
	}, []);

	return (
		<div className="absolute top-8 right-0 z-[99999999] rounded-lg dark:shadow-shadowBorder shadow-shadowInbox w-[480px]">
			<div className="flex flex-col dark:bg-bgPrimary bg-white border-borderDefault dark:text-contentSecondary text-black text-[14px] rounded-lg w-1/2 min-w-[480px] max-w-[600px] z-50 overflow-hidden">
				<div className="py-2 px-3 dark:bg-bgTertiary bg-bgLightTertiary">
					<div className="flex flex-row gap-2 items-center font-bold text-[16px]">
						<InboxButton />
						<div>Inbox </div>
					</div>
					<div className="flex flex-row">
						<div className="flex flex-row gap-4 py-3 w-[70%]">
							{tabDataNotify.map((tab, index: number) => {
								return (
									<div key={index}>
										<button
											className={`px-2 py-[4px] rounded-[4px] text-base font-medium ${currentTabNotify === tab.value ? 'dark:bg-bgTertiary bg-bgLightModeButton dark:text-contentPrimary text-colorTextLightMode' : ''}`}
											tabIndex={index}
											onClick={() => handleChangeTab(tab.value)}
										>
											{tab.title}
										</button>
									</div>
								);
							})}
						</div>

						<div className="w-[30%] flex flex-row justify-end items-center">
							<button onClick={handleMarkAllAsRead} className="w-fit text-xs hover:underline">
								Mark all as read
							</button>
						</div>
					</div>
				</div>

				<div
					className={`dark:bg-bgSecondary bg-bgLightSecondary flex flex-col max-w-[600px] max-h-heightInBox overflow-y-auto overflow-x-hidden ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
				>
					{currentTabNotify === InboxType.INDIVIDUAL && (
						<div>
							{notificationItem.length > 0 ? (
								notificationItem.map((notify, index) => (
									<NotificationItem notify={notify} key={`individual-${notify?.id}-${index}`} />
								))
							) : (
								<EmptyNotification isEmptyForYou />
							)}
						</div>
					)}

					{currentTabNotify === InboxType.UNREADS && (
						<div>
							{replyAndMentionNotification.length > 0 ? (
								<NotificationChannel isUnreadTab={true} unreadListConverted={replyAndMentionNotification} />
							) : (
								<EmptyNotification isEmptyUnread />
							)}
						</div>
					)}

					{currentTabNotify === InboxType.MENTIONS && (
						<div>
							{notifyMentionItem.length > 0 ? (
								notifyMentionItem.map((notification: INotification, index: number) => (
									<NotificationChannel
										key={`mention-${notification?.id}-${index}`}
										isUnreadTab={false}
										unreadListConverted={[]}
										notification={notification}
									/>
								))
							) : (
								<EmptyNotification isEmptyMentions />
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default NotificationList;

function InboxButton() {
	return (
		<div>
			<Icons.Inbox />
		</div>
	);
}
