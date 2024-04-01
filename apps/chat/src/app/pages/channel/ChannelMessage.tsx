import { EmojiPickerPanel, MessageWithUser, UnreadMessageBreak, ChannelMessageOpt } from '@mezon/components';
import { useChatMessage, useChatSending } from '@mezon/core';
import { emojiActions, referencesActions, selectEmojiOpenEditState, selectEmojiReactedBottomState, selectEmojiReactedState, selectMemberByUserId, selectMessageReplyState, selectReference, useAppDispatch } from '@mezon/store';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
	mode: number;
	channelId: string;
	channelLabel: string;
};

export function ChannelMessage(props: MessageProps) {
	const { message, lastSeen, preMessage, mode, channelId, channelLabel } = props;
	const { markMessageAsSeen } = useChatMessage(message.id);
	const user = useSelector(selectMemberByUserId(message.sender_id));
	const { EditSendMessage } = useChatSending({ channelId: channelId || '', channelLabel: channelLabel || '', mode });

	const dispatch = useAppDispatch();
	const refMessage = useSelector(selectReference);
	const emojiReactedState = useSelector(selectEmojiReactedState);
    const emojiReactedBottomState = useSelector(selectEmojiReactedBottomState);
    const emojiOpenEditState = useSelector(selectEmojiOpenEditState);

	useEffect(() => {
		markMessageAsSeen(message);
	}, [markMessageAsSeen, message]);	

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

	const handleCancelEdit = () => {
		dispatch(emojiActions.setEmojiOpenEditState(false));
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
				${(emojiReactedState && mess.id === refMessage?.id) || (emojiReactedBottomState && mess.id === refMessage?.id) || (emojiOpenEditState && mess.id === refMessage?.id) ? '' : 'hidden group-hover:block'} `}
			>
				<ChannelMessageOpt message={mess} />

				{/* {mess.id === refMessage?.id && (
					<div className="w-fit fixed right-16 bottom-[6rem]">
						<div className="scale-75 transform mb-0 z-10">
							<EmojiPickerPanel messageEmoji={mess} emojiAction={EmojiPlaces.EMOJI_REACTION} />
						</div>
					</div>
				)} */}
			</div>
			{ emojiReactedState && mess.id === refMessage?.id && (
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
