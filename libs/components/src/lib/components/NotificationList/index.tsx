import { useNotification } from '@mezon/core';
import NotificationItem from './NotificationItem';
import { Notification } from 'vendors/mezon-js/packages/mezon-js/dist';
import * as Icons from '../Icons';
import { Dropdown } from 'flowbite-react';
import { INotification } from 'libs/store/src/lib/notification/notify.slice';
import { useState } from 'react';
export type MemberListProps = { className?: string };

const tabDataNotify = [
    { title: 'For you', value: 'individual' },
    { title: 'Mention', value: 'mention' },
];

function NotificationList() {
    const { notification } = useNotification();
    const [currentTabNotify, setCurrentTabNotify] = useState('individual')

    const filterStatusNotify = () => {
        switch (currentTabNotify) {
            case 'individual':
                return notification.filter((item: INotification) => item.code === -2 || item.code === -3);
            case 'mention':
                return notification.filter((item: INotification) => item.code === -9);
            default:
                return notification;
        }
    };

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
            <div className='py-2 px-3 bg-bgPrimary w-[500px]'>
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
            <div className="bg-bgSecondary flex flex-col flex-col-reverse max-w-[800px] max-h-[700px] overflow-auto">
                {filterStatusNotify().map((notify: INotification) => (
                    <NotificationItem notify={notify} key={notify.id} />
                ))}
            </div>
        </Dropdown>
    );
}

export default NotificationList;

function InboxButton() {
    return (
        <button>
            <Icons.Inbox />
        </button>
    );
}