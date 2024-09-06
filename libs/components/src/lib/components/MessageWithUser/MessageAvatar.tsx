import { AvatarImage, ShortUserProfile } from '@mezon/components';
import { useGetPriorityNameFromUserClan, useOnClickOutside } from '@mezon/core';
import { IMessageWithUser, MouseButton } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useMessageParser } from './useMessageParser';
import usePendingNames from './usePendingNames';
type IMessageAvatarProps = {
	message: IMessageWithUser;
	isCombine: boolean;
	isEditing?: boolean;
	isShowFull?: boolean;
	mode?: number;
};

const MessageAvatar = ({ message, isCombine, isEditing, isShowFull, mode }: IMessageAvatarProps) => {
	const { senderId, username, avatarSender, userClanAvatar, userClanNickname, userDisplayName } = useMessageParser(message);
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
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const popupRef = useRef<HTMLDivElement | null>(null);
	const [positionBottom, setPositionBottom] = useState(false);
	const [positionTop, setPositionTop] = useState(0);

	const handleMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (event.button === MouseButton.LEFT) {
			setIsShowPanelChannel((prev) => !prev);
			setIsLoading(true);
			const clickY = event.clientY;
			const windowHeight = window.innerHeight;

			requestAnimationFrame(() => {
				if (popupRef.current) {
					const popupHeight = popupRef.current.getBoundingClientRect().height;
					const distanceToBottom = windowHeight - clickY;

					if (distanceToBottom < popupHeight) {
						setPositionBottom(true);
						setPositionTop(clickY - popupHeight);
					} else {
						setPositionBottom(false);
						setPositionTop(clickY - 50);
					}
					setIsLoading(false);
				}
			});
		}
	}, []);

	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));

	const isAnonymous = useMemo(() => senderId === process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID, [senderId]);

	if (message.references?.length === 0 && isCombine && !isShowFull) {
		return (
			<div className="w-10 flex items-center justify-center min-w-10">
				<div className="hidden group-hover:text-zinc-400 group-hover:text-[10px] group-hover:block cursor-default">{messageHour}</div>
			</div>
		);
	}

	return (
		<div className="relative group">
			<div className="pt-1" ref={panelRef} onMouseDown={handleMouseClick}>
				<AvatarImage
					onContextMenu={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					alt={username ?? ''}
					userName={username}
					src={
						mode === ChannelStreamMode.STREAM_MODE_CHANNEL
							? pendingClanAvatar
								? pendingClanAvatar
								: pendingUserAvatar
							: pendingUserAvatar
					}
					className="min-w-10 min-h-10"
					classNameText="font-semibold"
					isAnonymous={isAnonymous}
				/>
			</div>
			<div className="relative">
				{isShowPanelChannel && (
					<div
						ref={popupRef}
						className={`dark:bg-black bg-gray-200 mt-[10px] w-[300px] max-w-[89vw] rounded-lg flex flex-col z-10 fixed left-5 sbm:left-0 md:left-[409px] transition-opacity duration-300 ease-in-out ${isLoading ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
						style={{ top: !positionBottom ? `${positionTop}px` : 'unset', bottom: positionBottom ? '64px' : 'unset' }}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<ShortUserProfile
							userID={senderId}
							message={message}
							mode={mode}
							avatar={userClanAvatar || pendingUserAvatar}
							name={userClanNickname || userDisplayName || username}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default memo(MessageAvatar);
