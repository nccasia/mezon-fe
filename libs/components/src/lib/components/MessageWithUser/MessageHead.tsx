import { ShortUserProfile } from '@mezon/components';
import { useOnClickOutside } from '@mezon/core';
import { IChannelMember, IMessageWithUser } from '@mezon/utils';
import { useRef, useState } from 'react';
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
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
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

	if (isCombine && message.references?.length === 0) {
		return <></>;
	}

	return (
		<div className="relative group">
			<div className="flex-row items-center w-full gap-4 flex">
				<div
					className="text-sm text-white font-[600] text-[15px] tracking-wider cursor-pointer break-all username"
					ref={panelRef}
					onMouseDown={(event) => handleMouseClick(event)}
				>
					{username? username: 'Anonymous'}
				</div>
				<div className=" text-zinc-400 text-[10px] cursor-default">{messageTime}</div>
			</div>
			{isShowPanelChannel && (
				<div
					className={`bg-[#151515] mt-[10px] w-[360px] rounded-lg flex flex-col z-10 opacity-100 fixed `}
					style={{
						left: `${positionLeft}px`,
						top: positionBottom ? '' : `${positionTop}px`,
						bottom: positionBottom ? '64px' : '',
					}}
				>
					<ShortUserProfile userID={user?.user?.id || ''} />
				</div>
			)}
		</div>
	);
};

export default MessageHead;
