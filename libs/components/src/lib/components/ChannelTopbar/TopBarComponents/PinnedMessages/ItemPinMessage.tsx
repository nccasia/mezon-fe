import { useGetPriorityNameFromUserClan, useJumpToMessage } from '@mezon/core';
import { PinMessageEntity, messagesActions, pinMessageActions, selectCurrentClanId } from '@mezon/store';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MemberProfile from '../../../MemberProfile';
import MessageLine from '../../../MessageWithUser/MessageLine';
import { ModalDeletePinMess } from './DeletePinMessPopup';

type ItemPinMessageProps = {
	pinMessage: PinMessageEntity;
	contentString: string | undefined;
	handleUnPinMessage: (value: string) => void;
	onClose: () => void;
};

const ItemPinMessage = (props: ItemPinMessageProps) => {
	const { pinMessage, contentString, handleUnPinMessage, onClose } = props;
	const [openModalDelPin, setOpenModalDelPin] = useState(false);
	const { priorityAvatar, namePriority } = useGetPriorityNameFromUserClan(pinMessage.sender_id || '');

	const currentClanID = useSelector(selectCurrentClanId);
	const dispatch = useDispatch();
	const { directToMessageById } = useJumpToMessage({
		channelId: pinMessage?.channel_id || '',
		messageID: pinMessage.message_id || '',
		clanId: currentClanID || '',
	});
	const handleJumpMess = () => {
		dispatch(pinMessageActions.setJumpPinMessageId(pinMessage.message_id));
		onClose();
		dispatch(messagesActions.setIdMessageToJump(pinMessage.message_id));
		directToMessageById();
	};

	return (
		<div
			key={pinMessage.id}
			className="flex flex-row justify-between dark:hover:bg-bgSecondaryHover dark:bg-bgPrimary hover:bg-bgLightModeThird bg-white dark: py-3 px-3 mx-2 w-widthPinMess cursor-pointer rounded overflow-hidden border dark:border-gray-700 border-gray-300 group/item-pinMess"
		>
			<div className="flex items-start gap-2">
				<MemberProfile
					isHideUserName={true}
					avatar={priorityAvatar ? priorityAvatar : pinMessage.avatar || ''}
					name={namePriority ? namePriority : pinMessage.username || ''}
					isHideStatus={true}
					isHideIconStatus={true}
					textColor="#fff"
				/>
				<div className="flex flex-col gap-1 text-left">
					<div>
						<span className="font-medium dark:text-textDarkTheme text-textLightTheme">
							{namePriority ? namePriority : pinMessage.username || ''}
						</span>
					</div>
					<div className="leading-6">
						<MessageLine content={JSON.parse(pinMessage.content || '')} isJumMessageEnabled={false} isTokenClickAble={false} />
					</div>
				</div>
			</div>
			<div className="h-fit flex gap-x-2 items-center opacity-0 group-hover/item-pinMess:opacity-100">
				<p
					onClick={handleJumpMess}
					className="text-xs dark:bg-bgTertiary bg-bgLightModeButton rounded p-1 h-fit dark:text-white text-colorTextLightMode"
				>
					Jump
				</p>
				<button
					className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 items-center justify-center text-[10px] px-3 py-2 flex"
					onClick={() => {
						setOpenModalDelPin(true);
					}}
				>
					✕
				</button>
			</div>
			{openModalDelPin && (
				<ModalDeletePinMess
					pinMessage={pinMessage}
					contentString={contentString}
					handlePinMessage={() => handleUnPinMessage(pinMessage.message_id || '')}
					closeModal={() => setOpenModalDelPin(false)}
				/>
			)}
		</div>
	);
};

export default ItemPinMessage;
