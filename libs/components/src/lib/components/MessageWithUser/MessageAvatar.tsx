import { AvatarImage, ShortUserProfile } from '@mezon/components';
import { useOnClickOutside } from '@mezon/core';
import { IMessageWithUser, MouseButton } from '@mezon/utils';
import { useMemo, useRef, useState } from 'react';
import { useMessageParser } from './useMessageParser';
type IMessageAvatarProps = {
	message: IMessageWithUser;
	isCombine: boolean;
	isEditing?: boolean;
	isShowFull?: boolean;
	mode?: number;
};

const MessageAvatar = ({ message, isCombine, isEditing, isShowFull, mode }: IMessageAvatarProps) => {
	const { messageHour } = useMessageParser(message);
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionBottom, setPositionBottom] = useState(false);
	const [positionTop, setPositionTop] = useState(0);
	const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (event.button === MouseButton.LEFT) {
			setIsShowPanelChannel(true);
			const clickY = event.clientY;
			const windowHeight = window.innerHeight;
			const distanceToBottom = windowHeight - clickY;
			const heightElementShortUserProfileMin = 313;
			setPositionTop(clickY - 50);
			if (distanceToBottom < heightElementShortUserProfileMin) {
				setPositionBottom(true);
			}
		}
	};
	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));
	const handleDefault = (e: any) => {
		e.stopPropagation();
	};

	const isAnonymous = useMemo(() => message?.sender_id === process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID, [message?.sender_id]);

	if (message.references?.length === 0 && isCombine && !isShowFull) {
		return (
			<div className="w-10 flex items-center justify-center min-w-10">
				<div className="hidden group-hover:text-zinc-400 group-hover:text-[10px] group-hover:block cursor-default">{messageHour}</div>
			</div>
		);
	}

	return (
		<div className="relative group">
			<div className="pt-1" ref={panelRef} onMouseDown={(event) => handleMouseClick(event)}>
				<AvatarImage
					onContextMenu={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					alt={message.username || ''}
					userName={message.username}
					src={message.avatar}
					className="min-w-10 min-h-10"
					isAnonymous={isAnonymous}
				/>
			</div>
			{isShowPanelChannel ? (
				<div
					className={`dark:bg-black bg-gray-200 mt-[10px] w-[300px] max-w-[89vw] rounded-lg flex flex-col z-10 opacity-100 shortUserProfile fixed left-5 sbm:left-0 md:left-[409px] `}
					style={{ top: positionBottom ? '' : `${positionTop + 'px'}`, bottom: positionBottom ? '64px' : '' }}
					onMouseDown={handleDefault}
				>
					<ShortUserProfile userID={message.sender_id || ''} message={message} mode={mode} />
				</div>
			) : null}
		</div>
	);
};

export default MessageAvatar;
