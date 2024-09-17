import { ModalUserProfile, useMessageContextMenu } from '@mezon/components';
import { useGetPriorityNameFromUserClan, useOnClickOutside, useShowName } from '@mezon/core';
import { HEIGHT_PANEL_PROFILE, HEIGHT_PANEL_PROFILE_DM, IMessageWithUser, WIDTH_PANEL_PROFILE, handleShowShortProfile } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useEffect, useRef, useState } from 'react';
import { useMessageParser } from './useMessageParser';
import usePendingNames from './usePendingNames';

type IMessageHeadProps = {
	message: IMessageWithUser;
	isCombine: boolean;
	isShowFull?: boolean;
	mode?: number;
	allowDisplayShortProfile: boolean;
};

const MessageHead = ({ message, isCombine, isShowFull, mode, allowDisplayShortProfile }: IMessageHeadProps) => {
	const { messageTime } = useMessageParser(message);
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const panelRefShort = useRef<HTMLDivElement>(null);
	const [positionLeft, setPositionLeft] = useState(0);

	const { userClanNickname, userDisplayName, username, senderId, userClanAvatar, avatarSender } = useMessageParser(message);
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
	const { posShortProfile, setPosShortProfile } = useMessageContextMenu();

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

	useEffect(() => {
		const updatePosition = () => {
			const width = window.innerWidth;
			if (panelRefShort.current) {
				if (width >= 910) {
					panelRefShort.current.style.left = `${positionLeft}px`;
				} else if (width >= 480 && width < 910) {
					panelRefShort.current.style.left = `42px`;
				} else {
					panelRefShort.current.style.left = `20px`;
				}
			}
		};

		updatePosition();
		window.addEventListener('resize', updatePosition);

		return () => {
			window.removeEventListener('resize', updatePosition);
		};
	}, [positionLeft]);

	if (isCombine && message.references?.length === 0 && !isShowFull) {
		return <></>;
	}

	return (
		<div className="relative group">
			<div className="flex-row items-center w-full gap-4 flex">
				<div
					className="text-base text-textLightUserName font-medium tracking-normal cursor-pointer break-all username hover:underline"
					ref={panelRef}
					onMouseDown={handleMouseClick}
					role="button"
					style={{ letterSpacing: '-0.01rem' }}
				>
					{mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? nameShowed : userDisplayName ? userDisplayName : username}
				</div>
				<div className=" dark:text-zinc-400 text-colorTextLightMode text-[10px] cursor-default">{messageTime}</div>
			</div>
			{isShowPanelChannel && allowDisplayShortProfile && (
				<div
					className={`dark:bg-black bg-gray-200 mt-[10px] w-[300px] max-w-[89vw] rounded-lg flex flex-col z-10 opacity-100 fixed `}
					style={{
						left: posShortProfile.left,
						top: posShortProfile.top,
						bottom: posShortProfile.bottom,
						right: posShortProfile.right
					}}
					role="button"
					onMouseDown={(e) => e.stopPropagation()}
				>
					<ModalUserProfile
						userID={senderId}
						classBanner="rounded-tl-lg rounded-tr-lg h-[105px]"
						message={message}
						mode={mode}
						positionType={''}
						avatar={userClanAvatar}
						name={userClanNickname || userDisplayName || username}
						isDM={mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? true : false}
					/>
				</div>
			)}
		</div>
	);
};

export default memo(MessageHead);
