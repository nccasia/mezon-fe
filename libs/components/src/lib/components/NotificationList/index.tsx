import { useNotification } from '@mezon/core';
import NotificationItem from './NotificationItem';
import * as Icons from '../Icons';
import { Dropdown } from 'flowbite-react';
import { INotification } from 'libs/store/src/lib/notification/notify.slice';
import { useState } from 'react';
import NotifyMentionItem from './NotifyMentionItem';
import { ChannelMessage } from 'vendors/mezon-js/packages/mezon-js/dist';
export type MemberListProps = { className?: string };

const tabDataNotify = [
    { title: 'For you', value: 'individual' },
    { title: 'Mention', value: 'mention' },
];

function NotificationList() {
    const { notification, notifyMention } = useNotification();
    const [currentTabNotify, setCurrentTabNotify] = useState('individual')
    const handleChangeTab = (valueTab: string) => {
        setCurrentTabNotify(valueTab)
    };

    return (
        <Dropdown
            label=""
            className="bg-bgPrimary border-borderDefault text-contentSecondary pt-1 text-[14px] rounded-[8px] mt-1"
            dismissOnClick={true}
            placement="bottom"
            renderTrigger={() => (
                <div>
                    <InboxButton />
                </div>
            )}
        >
            <div className='py-2 px-3 bg-bgPrimary w-[600px]'>
                <div className='flex flex-row gap-2 items-center font-bold text-[16px]'>
                    <InboxButton />
                    <div>InBox </div>
                </div>
                <div className="flex flex-row gap-4 py-3">
                    {tabDataNotify.map((tab, index) => (
                        <div key={index}>
                            <button
                                className={`px-2 py-[4px] rounded-[4px] font-[600] ${currentTabNotify === tab.value ? 'bg-bgTertiary text-contentPrimary font-[700]' : ''}`}
                                tabIndex={index}
                                onClick={() => handleChangeTab(tab.value)}
                            >
                                {tab.title}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {currentTabNotify === 'individual' && (<div className="bg-bgSecondary flex flex-col flex-col-reverse max-w-[800px] max-h-[700px] overflow-auto">
                {notification.map((notify: INotification) => (
                    <NotificationItem notify={notify} key={notify.id} />
                ))}
            </div>
            )}
            {currentTabNotify === 'mention' && (<div className="bg-bgSecondary flex flex-col flex-col-reverse max-w-[600px] max-h-[600px] overflow-auto">
                {notifyMention.map((notify: ChannelMessage) => (
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