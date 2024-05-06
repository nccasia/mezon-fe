import { useChannels, useNotification } from '@mezon/core';
import { INotification } from '@mezon/store';
import { useState } from 'react';
import * as Icons from '../Icons';
import NotificationItem from './NotificationItem';
import NotifyMentionItem from './NotifyMentionItem';

export type MemberListProps = { className?: string };

const tabDataNotify = [
	{ title: 'For you', value: 'individual' },
	{ title: 'Mention', value: 'mention' },
];

function NotificationList() {
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

	return (
		<div className="absolute top-8 right-0 shadow z-[99999999]">
			<div className="flex flex-col bg-bgPrimary border-borderDefault text-contentSecondary pt-1 text-[14px] rounded-lg mt-1 w-1/2 min-w-[480px] max-w-[600px] z-50 overflow-hidden">
				<div className="py-2 px-3 bg-bgPrimary">
					<div className="flex flex-row gap-2 items-center font-bold text-[16px]">
						<InboxButton />
						<div>Inbox </div>
					</div>
					<div className="flex flex-row gap-4 py-3">
						{tabDataNotify.map((tab, index: number) => {
							return (
								<div key={index}>
									<button
										className={`px-2 py-[4px] rounded-[4px] text-base font-medium ${currentTabNotify === tab.value ? 'bg-bgTertiary text-contentPrimary' : ''}`}
										tabIndex={index}
										onClick={() => handleChangeTab(tab.value)}
									>
										{tab.title}
									</button>
								</div>
							);
						})}
					</div>
				</div>
				{currentTabNotify === 'individual' && (
					<div className="bg-bgSecondary flex flex-col-reverse max-w-[600px] max-h-heightInBox overflow-y-auto">
						{notificationItem.map((notify: INotification) => (
							<NotificationItem notify={notify} key={notify.id} />
						))}
					</div>
				)}
				{currentTabNotify === 'mention' && (
					<div className="bg-bgSecondary flex flex-col-reverse max-w-[600px] max-h-heightInBox overflow-auto">
						{notifyMentionItem.map((notify: INotification) => (
							<NotifyMentionItem notify={notify} key={notify.id} />
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
