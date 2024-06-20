import { ShortUserProfile } from '@mezon/components';
import { useOnClickOutside } from '@mezon/core';
import { selectCurrentClan, selectUserClanProfileByClanID } from '@mezon/store';
import { IChannelMember, IMessageWithUser } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMessageParser } from './useMessageParser';
import { useMessageSender } from './useMessageSender';
type IMessageHeadProps = {
	user?: IChannelMember | null;
	message: IMessageWithUser;
	isCombine: boolean;
};

const MessageHead = ({ user, message, isCombine }: IMessageHeadProps) => {
	const { username } = useMessageSender(user);
	const { messageTime } = useMessageParser(message);

	const currentClan = useSelector(selectCurrentClan);
	const clanProfile = useSelector(selectUserClanProfileByClanID(currentClan?.clan_id as string, user?.user?.id as string));

	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const panelRefShort = useRef<HTMLDivElement>(null);
	const [positionLeft, setPositionLeft] = useState(0);
	const [positionTop, setPositionTop] = useState(0);
	const [positionBottom, setPositionBottom] = useState(false);

	const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (event.button === 0) {
			setIsShowPanelChannel(true);
			const clickY = event.clientY;
			const windowHeight = window.innerHeight;
			const distanceToBottom = windowHeight - clickY;
			const elementName = event.currentTarget;
			if (elementName) {
				setPositionLeft(elementName.getBoundingClientRect().width + 420);
				setPositionTop(clickY - 50);
				setPositionBottom(false);
			}
			const heightElementShortUserProfileMin = 313;
			if (distanceToBottom < heightElementShortUserProfileMin) {
				setPositionBottom(true);
			}
		}
	};
	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));
	const handleDefault = (e: any) => {
		e.stopPropagation();
	};

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

	if (isCombine && message.references?.length === 0) {
		return <></>;
	}

	return (
		<div className="relative group">
			<div className="flex-row items-center w-full gap-4 flex">
				<div
					className="text-base text-textLightUserName dark:text-white font-medium tracking-wider cursor-pointer break-all username"
					ref={panelRef}
					onMouseDown={(event) => handleMouseClick(event)}
					role="button"
				>
					{clanProfile?.nick_name || username || 'Anonymous'}
				</div>
				<div className=" dark:text-zinc-400 text-colorTextLightMode text-[10px] cursor-default">{messageTime}</div>
			</div>
			{isShowPanelChannel && (
				<div
					className={`dark:bg-black bg-gray-200 mt-[10px] w-[360px] max-w-[89vw] rounded-lg flex flex-col z-10 opacity-100 fixed `}
					style={{
						left: `20px`,
						top: positionBottom ? '' : `${positionTop}px`,
						bottom: positionBottom ? '64px' : '',
					}}
					onMouseDown={handleDefault}
					role="button"
					ref={panelRefShort}
				>
					<ShortUserProfile userID={user?.user?.id || ''} />
				</div>
			)}
		</div>
	);
};

export default MessageHead;
