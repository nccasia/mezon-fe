import { EmojiPickerComp, Icons, MessageWithUser, UnreadMessageBreak } from '@mezon/components';
import { ChatContext, useChatMessage, useChatSending } from '@mezon/core';
import { selectMemberByUserId } from '@mezon/store';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
	myUser?: string;
	mode: number;
	channelId: string;
	channelLabel: string;
};

export function ChannelMessage(props: MessageProps) {
	const { message, lastSeen, preMessage, myUser, mode, channelId, channelLabel } = props;
	const { markMessageAsSeen } = useChatMessage(message.id);
	const user = useSelector(selectMemberByUserId(message.sender_id));
	const { EditSendMessage } = useChatSending({ channelId: channelId || '', channelLabel: channelLabel || '', mode });
	useEffect(() => {
		markMessageAsSeen(message);
	}, [markMessageAsSeen, message]);

	// TODO: recheck this

	const mess = useMemo(() => {
		if (typeof message.content === 'object' && typeof (message.content as any).id === 'string') {
			return message.content;
		}
		return message;
	}, [message]);

	const [editMessage, setEditMessage] = useState(mess.content.t);
	const [newMessage, setNewMessage] = useState('');

	const messPre = useMemo(() => {
		if (preMessage && typeof preMessage.content === 'object' && typeof (preMessage.content as any).id === 'string') {
			return preMessage.content;
		}
		return preMessage;
	}, [preMessage]);

	const { isOpenEmojiReacted, setIsOpenEmojiReacted, setIsOpenEmojiMessBox } = useContext(ChatContext);

	const { isOpenReply, setMessageRef, setIsOpenReply, messageRef, setIsOpenEdit, isOpenEdit } = useContext(ChatContext);

	const handleClickReply = () => {
		setIsOpenReply(true);
		setIsOpenEdit(false);
		setMessageRef(mess);
	};

	const handleClickEdit = () => {
		setIsOpenEdit(true);
		setIsOpenReply(false);
		setMessageRef(mess);
	};

	const handleCancelEdit = () => {
		setIsOpenEdit(false);
	};

	const { emojiPlaceActive, setEmojiPlaceActive, widthEmojiBar, isOpenEmojiReactedBottom, setIsOpenEmojiReactedBottom } = useContext(ChatContext);
	const handleClickReact = (event: React.MouseEvent<HTMLDivElement>) => {
		setEmojiPlaceActive(EmojiPlaces.EMOJI_REACTION);
		setIsOpenEmojiReactedBottom(false);
		setIsOpenEmojiMessBox(false);
		setIsOpenEmojiReacted(true);
		setMessageRef(mess);
		event.stopPropagation();
	};

	const onSend = (e: React.KeyboardEvent<Element>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			if (editMessage) {
				handleSend(editMessage, message.id);
				setNewMessage(editMessage);
				handleCancelEdit();
			}
		}
		if (e.key === 'Escape') {
			handleCancelEdit();
		}
	};
	const handleSend = useCallback(
		(editMessage: string, messageId: string) => {
			EditSendMessage(editMessage, messageId);
		},
		[EditSendMessage],
	);
	const onchange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setEditMessage(e.target.value);
		updateTextareaHeight(e.target);
	};
	const updateTextareaHeight = (textarea: HTMLTextAreaElement) => {
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	};

	return (
		<div className="fullBoxText relative group hover:bg-gray-950/[.07]">
			<MessageWithUser
				message={mess as IMessageWithUser}
				preMessage={messPre as IMessageWithUser}
				user={user}
				mode={mode}
				newMessage={newMessage}
			/>
			{lastSeen && <UnreadMessageBreak />}

			<div
				className={`chooseForText z-10 top-[-18px] absolute h-8 p-0.5 rounded-md right-4 w-24 block bg-bgSecondary
				 ${(isOpenEmojiReacted && mess.id === messageRef?.id) || (isOpenEmojiReactedBottom && mess.id === messageRef?.id) || (isOpenEdit && mess.id === messageRef?.id) ? '' : 'hidden group-hover:block'} `}
			>
				<div className="iconHover flex justify-between">
					<div onClick={handleClickReact} className="h-full p-1 cursor-pointer">
						<Icons.Smile defaultFill={`${isOpenEmojiReacted && mess.id === messageRef?.id ? '#FFFFFF' : '#AEAEAE'}`} />
					</div>

					{myUser === message.sender_id ? (
						<button onClick={handleClickEdit} className="h-full p-1 cursor-pointer">
							<Icons.PenEdit defaultFill={isOpenEdit && mess.id === messageRef?.id ? '#FFFFFF' : '#AEAEAE'} />
						</button>
					) : (
						<button onClick={handleClickReply} className="h-full px-1 pb-[2px] rotate-180">
							<Icons.Reply defaultFill={isOpenReply ? '#FFFFFF' : '#AEAEAE'} />
						</button>
					)}
					<button className="h-full p-1 cursor-pointer">
						<Icons.ThreeDot />
					</button>
				</div>

				{isOpenEmojiReacted && mess.id === messageRef?.id && (
					<div className="w-fit fixed right-16 bottom-[6rem]">
						<div className="scale-75 transform mb-0 z-10">
							<EmojiPickerComp messageEmoji={mess} emojiAction={EmojiPlaces.EMOJI_REACTION} />
						</div>
					</div>
				)}
			</div>
			{isOpenEdit && mess.id === messageRef?.id && (
				<div className="inputEdit relative left-[66px] top-[-30px]">
					<textarea
						defaultValue={editMessage}
						className="w-[83%] bg-black rounded pl-4"
						onKeyDown={onSend}
						onChange={(e) => {
							onchange(e);
						}}
						rows={editMessage?.split('\n').length}
					></textarea>
					<p className="absolute -bottom-4 text-xs">escape to cancel • enter to save</p>
				</div>
			)}
		</div>
	);
}

ChannelMessage.Skeleton = () => {
	return (
		<div>
			<MessageWithUser.Skeleton />
		</div>
	);
};
