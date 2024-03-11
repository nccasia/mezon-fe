import { useNotification } from '@mezon/core';
import { Dropdown } from 'flowbite-react';
import { INotification } from 'libs/store/src/lib/notification/notify.slice';
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

	return (
		<Dropdown
			label=""
			className="bg-bgPrimary border-borderDefault text-contentSecondary pt-1 text-[14px] rounded-[8px] mt-1 w-1/2 min-w-[480px] max-w-[600px] z-50"
			dismissOnClick={true}
			placement="bottom"
			renderTrigger={() => (
				<div>
					<InboxButton />
				</div>
			)}
			theme={{}}
		>
			<div className="py-2 px-3 bg-bgPrimary">
				<div className="flex flex-row gap-2 items-center font-bold text-[16px]">
					<InboxButton />
					<div>InBox </div>
				</div>
				<div className="flex flex-row gap-4 py-3">
					{tabDataNotify.map((tab, index: number) => {
						return (
							<div key={index}>
								<button
									className={`px-2 py-[4px] rounded-[4px] font-[600] ${currentTabNotify === tab.value ? 'bg-bgTertiary text-contentPrimary font-[700]' : ''}`}
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
				<div className="bg-bgSecondary flex flex-col flex-col-reverse max-w-[600px] max-h-[600px] overflow-auto">
					{notification
						.filter((item) => item.code !== -9)
						.map((notify: INotification) => (
							<NotificationItem notify={notify} key={notify.id} />
						))}
				</div>
			)}
			{currentTabNotify === 'mention' && (
				<div className="bg-bgSecondary flex flex-col flex-col-reverse max-w-[600px] max-h-[600px] overflow-auto">
					{notification
						.filter((item) => item.code === -9)
						.map((notify: INotification) => (
							<NotifyMentionItem notify={notify} key={notify.id} />
						))}
				</div>
			)}
		</Dropdown>
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
