import { AvatarImage } from '@mezon/components';
import { useGetPriorityNameFromUserClan } from '@mezon/core';
import { IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useMemo } from 'react';
import { useMessageParser } from './useMessageParser';
import usePendingNames from './usePendingNames';

type IMessageAvatarProps = {
	message: IMessageWithUser;
	isCombine: boolean;
	isEditing?: boolean;
	isShowFull?: boolean;
	mode?: number;
	onClick?: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;
};

const MessageAvatar = ({ message, isCombine, isShowFull, mode, onClick }: IMessageAvatarProps) => {
	const { senderId, username, avatarSender, userClanAvatar } = useMessageParser(message);
	const { clanAvatar, generalAvatar } = useGetPriorityNameFromUserClan(message.sender_id);
	const { pendingUserAvatar, pendingClanAvatar } = usePendingNames(
		message,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		avatarSender,
		generalAvatar,
		clanAvatar,
		userClanAvatar
	);

	const { messageHour } = useMessageParser(message);

	const isAnonymous = useMemo(() => senderId === process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID, [senderId]);

	if (message.references?.length === 0 && isCombine && !isShowFull) {
		return (
			<div className="w-10 flex items-center justify-center min-w-10">
				<div className="hidden group-hover:text-zinc-400 group-hover:text-[10px] group-hover:block cursor-default">{messageHour}</div>
			</div>
		);
	}

	return (
		<AvatarImage
			onContextMenu={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
			alt={username ?? ''}
			userName={username}
			data-popover-target="popover-content"
			src={
				(mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? (pendingClanAvatar ? pendingClanAvatar : pendingUserAvatar) : pendingUserAvatar) ||
				avatarSender
			}
			className="min-w-10 min-h-10"
			classNameText="font-semibold"
			isAnonymous={isAnonymous}
			onClick={onClick}
		/>
	);
};

export default memo(MessageAvatar);
