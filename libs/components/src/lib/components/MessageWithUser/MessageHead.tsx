import { useGetPriorityNameFromUserClan, useShowName } from '@mezon/core';
import { IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo } from 'react';
import { useMessageParser } from './useMessageParser';
import usePendingNames from './usePendingNames';

type IMessageHeadProps = {
	message: IMessageWithUser;
	isCombine: boolean;
	isShowFull?: boolean;
	mode?: number;
	onClick?: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;
};

const MessageHead = ({ message, isCombine, isShowFull, mode, onClick }: IMessageHeadProps) => {
	const { messageTime } = useMessageParser(message);
	const { userClanNickname, userDisplayName, username, senderId } = useMessageParser(message);
	const { clanNick, displayName, usernameSender } = useGetPriorityNameFromUserClan(message.sender_id);
	const { pendingClannick, pendingDisplayName, pendingUserName } = usePendingNames(
		message,
		clanNick ?? '',
		displayName ?? '',
		usernameSender ?? '',
		userClanNickname ?? '',
		userDisplayName ?? '',
		username ?? ''
	);

	const nameShowed = useShowName(clanNick ? clanNick : (pendingClannick ?? ''), pendingDisplayName ?? '', pendingUserName ?? '', senderId ?? '');

	if (isCombine && message.references?.length === 0 && !isShowFull) {
		return <></>;
	}

	return (
		<div className="relative group">
			<div className="flex-row items-center w-full gap-4 flex">
				<div
					className="text-base text-textLightUserName font-medium tracking-normal cursor-pointer break-all username hover:underline"
					onClick={onClick}
					role="button"
					style={{ letterSpacing: '-0.01rem' }}
				>
					{mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? nameShowed : userDisplayName ? userDisplayName : username}
				</div>
				<div className=" dark:text-zinc-400 text-colorTextLightMode text-[10px] cursor-default">{messageTime}</div>
			</div>
		</div>
	);
};

export default memo(MessageHead);
