import { AvatarImage, ModalUserProfile, useMessageContextMenu } from '@mezon/components';
import { useGetPriorityNameFromUserClan, useOnClickOutside } from '@mezon/core';
import { HEIGHT_PANEL_PROFILE, HEIGHT_PANEL_PROFILE_DM, IMessageWithUser, WIDTH_PANEL_PROFILE, handleShowShortProfile } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useMemo, useRef, useState } from 'react';
import { useMessageParser } from './useMessageParser';
import usePendingNames from './usePendingNames';
type IMessageAvatarProps = {
	message: IMessageWithUser;
	isCombine: boolean;
	isEditing?: boolean;
	isShowFull?: boolean;
	mode?: number;
	allowDisplayShortProfile: boolean;
};

const MessageAvatar = ({ message, isCombine, isEditing, isShowFull, mode, allowDisplayShortProfile }: IMessageAvatarProps) => {
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
	const { posShortProfile, setPosShortProfile } = useMessageContextMenu();

	const { messageHour } = useMessageParser(message);
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);

	const handleMouseClick = () => {
		handleShowShortProfile(
			panelRef,
			WIDTH_PANEL_PROFILE,
			mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? HEIGHT_PANEL_PROFILE : HEIGHT_PANEL_PROFILE_DM,
			setIsShowPanelChannel,
			setPosShortProfile
		);
	};

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
						(mode === ChannelStreamMode.STREAM_MODE_CHANNEL
							? pendingClanAvatar
								? pendingClanAvatar
								: pendingUserAvatar
							: pendingUserAvatar) || avatarSender
					}
					className="min-w-10 min-h-10"
					classNameText="font-semibold"
					isAnonymous={isAnonymous}
				/>
			</div>
			<div className="relative">
				{isShowPanelChannel && allowDisplayShortProfile && (
					<div
						className={`dark:bg-black bg-gray-200 mt-[10px] w-[300px] max-w-[89vw] rounded-lg flex flex-col z-10 fixed left-5 sbm:left-0 md:left-[409px] transition-opacity duration-300 ease-in-out ${isLoading ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
						style={{
							left: posShortProfile.left,
							top: posShortProfile.top,
							bottom: posShortProfile.bottom,
							right: posShortProfile.right
						}}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<ModalUserProfile
							userID={senderId}
							classBanner="rounded-tl-lg rounded-tr-lg h-[105px]"
							message={message}
							mode={mode}
							positionType={''}
							avatar={userClanAvatar || pendingUserAvatar}
							name={userClanNickname || userDisplayName || username}
							isDM={mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? true : false}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default memo(MessageAvatar);
