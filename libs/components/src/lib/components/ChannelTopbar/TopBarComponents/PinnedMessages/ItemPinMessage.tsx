import { useGetPriorityNameFromUserClan } from '@mezon/core';
import { PinMessageEntity, messagesActions, pinMessageActions, selectMessageByMessageId, useAppDispatch } from '@mezon/store';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
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

	const dispatch = useAppDispatch();

	const handleJumpMess = () => {
		dispatch(pinMessageActions.setJumpPinMessageId(pinMessage.message_id));
		onClose();

		if (pinMessage.message_id && pinMessage.channel_id) {
			dispatch(messagesActions.jumpToMessage({ messageId: pinMessage.message_id ?? '', channelId: pinMessage.channel_id ?? '' }));
		}
	};

	const message = useSelector(selectMessageByMessageId(pinMessage.message_id as string));

	return (
		<div
			key={pinMessage.id}
			className="relative flex flex-row justify-between dark:hover:bg-bgSecondaryHover dark:bg-bgPrimary hover:bg-bgLightModeThird bg-white dark: py-3 px-3 mx-2 w-widthPinMess cursor-pointer rounded overflow-hidden border dark:border-bgTertiary border-gray-300 group/item-pinMess"
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
						<MessageLine
							isEditted={false}
							content={JSON.parse(pinMessage.content || '')}
							isJumMessageEnabled={false}
							isTokenClickAble={false}
						/>
					</div>
					{message?.attachments?.length ? <ListPinAttachment attachments={message?.attachments} /> : <></>}
				</div>
			</div>
			<div className="absolute h-fit flex gap-x-2 items-center opacity-0 right-2 top-2 group-hover/item-pinMess:opacity-100">
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
					attachments={message?.attachments ? message.attachments : []}
				/>
			)}
		</div>
	);
};

export const ListPinAttachment = ({ attachments }: { attachments: ApiMessageAttachment[] }) => {
	const gridClass = useMemo(() => {
		let classGridParent = '';
		let classGridChild = '';
		if (attachments.length >= 5) {
			classGridParent = `grid-cols-6`;
			if (attachments.length % 3 === 1) {
				classGridChild = classGridChild + ` col-span-2 first:col-span-6`;
			}
			if (attachments.length % 3 === 2) {
				classGridChild = classGridChild + `col-span-2 first:col-span-3 [&:nth-child(2)]:col-span-3`;
			} else {
				classGridChild = classGridChild + ` col-span-2 `;
			}
			return {
				classGridParent: classGridParent,
				classGridChild: classGridChild
			};
		}
		if (attachments.length < 5) {
			classGridParent = `grid-cols-2`;
			if (attachments.length % 2 === 1) {
				classGridChild = classGridChild + `col-span-1 first:col-span-2`;
			} else {
				classGridChild = classGridChild + `col-span-1`;
			}
			return {
				classGridParent: classGridParent,
				classGridChild: classGridChild
			};
		}
	}, [attachments]);
	return (
		<div className={`grid ${gridClass?.classGridParent} gap-1`}>
			{attachments.map((attach) => {
				return <img src={attach.url} className={`${gridClass?.classGridChild}`} />;
			})}
		</div>
	);
};

export default ItemPinMessage;
