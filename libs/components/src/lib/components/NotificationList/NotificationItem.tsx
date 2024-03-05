import { convertTimeString } from '@mezon/utils';
import { INotification } from 'libs/store/src/lib/notification/notify.slice';
import MemberProfile from '../MemberProfile';
import { useNotification } from '@mezon/core';
export type NotifyProps = {
    notify: INotification;
};

function NotificationItem({ notify }: NotifyProps) {
    const { deleteNotify } = useNotification();

    return (
        <div className='flex flex-row justify-between hover:bg-bgSurface py-3 px-3 w-full'>
            <div className="flex items-center gap-2">
                {(notify.code === -2 || notify.code === -3) && (
                    <MemberProfile
                        isHideUserName={true}
                        avatar={''}
                        name={notify?.contentNotify.username ?? ''}
                        isHideStatus={true}
                        isHideIconStatus={true}
                        textColor='#fff'
                    />
                )}
                <div className="flex flex-col gap-1">
                    <span>{notify?.subject}</span>
                    <span className="text-zinc-400 text-[11px]">{convertTimeString(notify.create_time as string)}</span>
                </div>

            </div>

            <button
                className="bg-bgTertiary mr-1 text-contentPrimary rounded-full w-6 h-6 flex items-center justify-center text-[10px]"
                onClick={() => { deleteNotify(notify.id) }}
            >
                ✕
            </button>

        </div>
    );
}

export default NotificationItem;
