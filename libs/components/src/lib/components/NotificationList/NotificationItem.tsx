import { useJumpToMessage, useNotification } from '@mezon/core';
import { selectCurrentClanId, selectMemberClanByUserId } from '@mezon/store';
import { convertTimeString } from '@mezon/utils';
import { INotification } from 'libs/store/src/lib/notification/notify.slice';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import MemberProfile from '../MemberProfile';
export type NotifyProps = {
	readonly notify: INotification;
};

function NotificationItem({ notify }: NotifyProps) {
	const { deleteNotify } = useNotification();
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
	const userName = notify?.content?.username;
	let notice = notify?.subject;
	if (userName) {
		const userNameLenght = userName.length;
		notice = notify?.subject?.slice(userNameLenght);
	}

	const messageID = useMemo(() => {
		return notify.content.message_id;
	}, [notify.content.message_id]);
	const channelId = useMemo(() => {
		return notify.content.channel_id;
	}, [notify.content.channel_id]);

	const { directToMessageById } = useJumpToMessage({ channelId, messageID });

	return (
		<div className="flex flex-row justify-between dark:hover:bg-bgSecondaryHover hover:bg-bgLightModeButton py-3 px-3 w-full cursor-pointer">
			<div onClick={directToMessageById} className="flex items-center gap-2">
				<MemberProfile
					isHideUserName={true}
					avatar={user?.user?.avatar_url || ''}
					name={notify?.content?.username ?? ''}
					isHideStatus={true}
					isHideIconStatus={true}
					textColor="#fff"
				/>
				<div className="flex flex-col gap-1">
					<div>
						<span className="font-bold">{userName}</span>
						<span>{notice}</span>
					</div>
					<span className="text-zinc-400 text-[11px]">{convertTimeString(notify.create_time as string)}</span>
				</div>
			</div>
			<button
				className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px]"
				onClick={() => {
					deleteNotify(notify.id);
				}}
			>
				✕
			</button>
		</div>
	);
}

export default NotificationItem;
