import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { MessageWithUser, UnreadMessageBreak } from '@mezon/components';
import { ChatContext, useChatMessage } from '@mezon/core';
import { selectMemberByUserId } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import * as Icons from 'libs/components/src/lib/components/Icons/index';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
};

export type ReactedOutsideOptional = {
	emoji: string;
	messageId: string;
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

	const [isOpenReactEmoji, setIsOpenReactEmoji] = useState(false);
	const [emojiPicker, setEmojiPicker] = useState<string>('');
	const [reactionOutside, setReactionOutside] = useState<ReactedOutsideOptional>();
	function EmojiReaction() {
		const handleEmojiSelect = (emoji: any) => {
			setEmojiPicker(emoji.native);
			setReactionOutside({ emoji: emoji.native, messageId: mess.id });
			setIsOpenReactEmoji(false);
		};
		return <Picker data={data} onEmojiSelect={handleEmojiSelect} />;
	}
	const { isOpenReply, setMessageRef, setIsOpenReply } = useContext(ChatContext);

	const handleClickReply = () => {
		setIsOpenReply(true);
		setMessageRef(mess);
	};

	return (
		<div className="relative group ">
			<MessageWithUser
				reactionOutsideProps={reactionOutside}
				message={mess as IMessageWithUser}
				preMessage={messPre as IMessageWithUser}
				user={user}
			/>
			{lastSeen && <UnreadMessageBreak />}
			<div className="z-20 top-[-15px] absolute h-[30px] p-0.5 rounded-md right-4 w-24 flex flex-row bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 group-hover:bg-slate-800">
				<button
					className="h-full p-1 group"
					onClick={() => {
						setIsOpenReactEmoji(!isOpenReactEmoji);
					}}
				>
					<Icons.Smile />
				</button>
				<button onClick={handleClickReply} className=" flex flex-row justify-center items-center rotate-180">
					<Icons.Reply />
				</button>
			</div>
			{isOpenReactEmoji && (
				<div className="absolute right-32 bottom-0 z-50">
					<EmojiReaction />
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
