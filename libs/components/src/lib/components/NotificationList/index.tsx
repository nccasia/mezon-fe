import { useChannels, useNotification } from '@mezon/core';
import { INotification, notificationActions, selectTheme } from '@mezon/store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../../../../../ui/src/lib/Icons';
import NotificationItem from './NotificationItem';
import NotifyMentionItem from './NotifyMentionItem';

export type MemberListProps = { className?: string };

export type NotificationProps = { unReadList?: string[] };

const tabDataNotify = [
	{ title: 'For you', value: 'individual' },
	{ title: 'Unreads', value: 'unreads' },
	{ title: 'Mentions', value: 'mentions' },
];

function NotificationList({ unReadList }: NotificationProps) {
	const dispatch = useDispatch();

	const tabMentionRef = useRef<HTMLDivElement | null>(null);
	const tabIndividualRef = useRef<HTMLDivElement | null>(null);
	const { notification } = useNotification();
	const [currentTabNotify, setCurrentTabNotify] = useState('individual');
	const handleChangeTab = (valueTab: string) => {
		setCurrentTabNotify(valueTab);
	};

	const { channels } = useChannels();
	const notificationItem = notification.filter(
		(item) => item.code !== -9 && channels.some((channel) => channel.channel_id === item.content.channel_id),
	);
	const notifyMentionItem = notification.filter(
		(item) => item.code === -9 && channels.some((channel) => channel.channel_id === item.content.channel_id),
	);
	const appearanceTheme = useSelector(selectTheme);
	useEffect(() => {
		if (currentTabNotify === 'unreads' && tabMentionRef.current) {
			tabMentionRef.current.scrollTop = -tabMentionRef.current.scrollHeight;
		}
		if (currentTabNotify === 'individual' && tabIndividualRef.current) {
			tabIndividualRef.current.scrollTop = -tabIndividualRef.current.scrollHeight;
		}
	}, [currentTabNotify, notifyMentionItem]);

	const readList = useMemo(() => {
		return notifyMentionItem.filter((item) => !unReadList?.includes(item.id));
	}, [notifyMentionItem, unReadList]);

	const unreadListRemain = useMemo(() => {
		return notifyMentionItem.filter((item) => !readList?.includes(item));
	}, [readList, notifyMentionItem, localStorage.getItem('notiUnread')]);

	const handleMarkAllAsRead = useCallback(() => {
		localStorage.setItem('notiUnread', JSON.stringify([]));
		dispatch(notificationActions.setStatusNoti());
	}, []);

	return (
		<div className="absolute top-8 right-0 shadow z-[99999999] ">
			<div className="flex flex-col dark:bg-bgPrimary bg-white border-borderDefault dark:text-contentSecondary text-black pt-1 text-[14px] rounded-lg mt-1 w-1/2 min-w-[480px] max-w-[600px] z-50 overflow-hidden">
				<div className="py-2 px-3 dark:bg-bgTertiary bg-white">
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
						{currentTabNotify === 'unreads' && unreadListRemain.length > 0 && (
							<div className="w-[30%] flex flex-row justify-end items-center">
								<button onClick={handleMarkAllAsRead} className="w-fit text-xs hover:underline">
									Mark all as read
								</button>
							</div>
						)}
					</div>
				</div>
				{currentTabNotify === 'individual' && (
					<div
						ref={tabIndividualRef}
						className="dark:bg-bgSecondary bg-gray-100 flex flex-col-reverse max-w-[600px] max-h-heightInBox overflow-y-auto"
					>
						{notificationItem.map((notify: INotification) => (
							<NotificationItem notify={notify} key={notify.id} />
						))}
					</div>
				)}
				{currentTabNotify === 'unreads' && (
					<div
						ref={tabMentionRef}
						className={`dark:bg-bgSecondary bg-gray-100 flex flex-col-reverse max-w-[600px] max-h-heightInBox overflow-auto ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
					>
						{unreadListRemain.map((notify: INotification) => (
							<NotifyMentionItem isUnreadTab={true} notify={notify} key={notify.id} />
						))}
					</div>
				)}
				{currentTabNotify === 'mentions' && (
					<div
						ref={tabMentionRef}
						className={`dark:bg-bgSecondary bg-gray-100 flex flex-col-reverse max-w-[600px] max-h-heightInBox overflow-auto ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
					>
						{readList.map((notify: INotification) => (
							<NotifyMentionItem isUnreadTab={false} notify={notify} key={notify.id} />
						))}
					</div>
				)}
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
