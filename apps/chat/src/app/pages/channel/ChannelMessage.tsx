import { EmojiPicker, Icons, MessageWithUser, ReactedOutsideOptional, UnreadMessageBreak } from '@mezon/components';
import { ChatContext, useChatMessage } from '@mezon/core';
import { selectMemberByUserId } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
};

export function ChannelMessage(props: MessageProps) {
	const { message, lastSeen, preMessage } = props;
	const { markMessageAsSeen } = useChatMessage(message.id);
	const user = useSelector(selectMemberByUserId(message.sender_id));

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

	const messPre = useMemo(() => {
		if (preMessage && typeof preMessage.content === 'object' && typeof (preMessage.content as any).id === 'string') {
			return preMessage.content;
		}
		return preMessage;
	}, [preMessage]);

	const [emojiPicker, setEmojiPicker] = useState<string>('');
	const [reactionOutside, setReactionOutside] = useState<ReactedOutsideOptional>();

	const { isOpenReply, setMessageRef, setIsOpenReply, messageRef, isOpenEmojiReacted, setIsOpenEmojiReacted, emojiSelected } =
		useContext(ChatContext);

	const handleClickReply = () => {
		setIsOpenReply(true);
		setMessageRef(mess);
	};

	const handleClickReact = () => {
		setIsOpenEmojiReacted(true);
		setMessageRef(mess);
		setReactionOutside({
			emoji: emojiSelected,
			messageId: messageRef?.id ?? '',
		});
	};

	return (
		<div id="messageWithUser" className="relative group hover:bg-gray-950/[.07]">
			<MessageWithUser
				reactionOutsideProps={reactionOutside}
				message={mess as IMessageWithUser}
				preMessage={messPre as IMessageWithUser}
				user={user}
			/>
			{lastSeen && <UnreadMessageBreak />}
			<div
				className={`z-10 top-[-18px] absolute h-[30px] p-0.5 rounded-md right-4 w-24 flex flex-row bg-bgSecondary ${isOpenEmojiReacted && mess.id === messageRef?.id ? 'block' : 'hidden'} group-hover:block`}
			>
				<div
					className="h-full p-1 group"
					onClick={(event) => {
						event.stopPropagation();
						handleClickReact();
					}}
				>
					<EmojiPicker
						messageEmoji={mess}
						classNameParentDiv="absolute z-50"
						classNameChildDiv={`absolute transform right-[110%] mr-[-2rem] bottom-[-5rem]`}
					/>
				</div>

				<button onClick={handleClickReply} className="rotate-180 absolute left-8 top-1.5">
					<Icons.Reply defaultFill={isOpenReply ? '#FFFFFF' : '#AEAEAE'} />
				</button>
			</div>
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
