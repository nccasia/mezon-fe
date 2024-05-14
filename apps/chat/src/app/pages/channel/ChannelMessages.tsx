
import { ChatWelcome } from '@mezon/components';
import { getJumpToMessageId, useChatMessages, useJumpToMessage, useReference } from '@mezon/core';
import { useEffect, useRef, useState } from 'react';
import { ChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
}

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const chatRef = useRef<HTMLDivElement>(null);

	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const [messageid, setMessageIdToJump] = useState(getJumpToMessageId());
	const [timeToJump, setTimeToJump] = useState(1000);
	const [positionToJump, setPositionToJump] = useState<ScrollLogicalPosition>('start');
	const { jumpToMessage } = useJumpToMessage();
	const { idMessageReplied } = useReference();


	useEffect(() => {
		const topDiv = chatRef?.current

		const handleScroll = () => {
			const scrollHeight = topDiv?.scrollHeight || 0;
			const clientHeight = topDiv?.clientHeight || 0;
			const scrollTop = topDiv?.scrollTop || 0;

			const scrollBottom = scrollHeight + (scrollTop - clientHeight);

			if (scrollBottom < 200 && hasMoreMessage) {
				loadMoreMessage();
			}
		}

		topDiv?.addEventListener('scroll', handleScroll);
		return () => {
			topDiv?.removeEventListener('scroll', handleScroll);
		}
	}, [hasMoreMessage, loadMoreMessage, chatRef])

	useEffect(() => {
		if (idMessageReplied) {
			setMessageIdToJump(idMessageReplied);
			setTimeToJump(0);
			setPositionToJump('center');
		} else {
			setMessageIdToJump(getJumpToMessageId());
			setTimeToJump(1000);
			setPositionToJump('start');
		}
	}, [getJumpToMessageId, idMessageReplied]);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null;
		if (messageid) {
			timeoutId = setTimeout(() => {
				jumpToMessage(messageid, positionToJump);
			}, timeToJump);
		}
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [messageid, jumpToMessage]);

	return (
		<div
			className="bg-bgPrimary relative h-full overflow-y-scroll overflow-x-hidden flex-col-reverse flex"
			id="scrollLoading"
			ref={chatRef}
		>
			{messages.map((message, i) => (
				<ChannelMessage
					mode={mode}
					key={message.id}
					lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
					message={message}
					preMessage={messages.length > 0 ? messages[i - 1] : undefined}
					channelId={channelId}
					channelLabel={channelLabel || ''}
				/>
			))}

			{!hasMoreMessage && <ChatWelcome type={type} name={channelLabel} avatarDM={avatarDM} />}
		</div>

	);
}

ChannelMessages.Skeleton = () => {
	return (
		<>
			<ChannelMessage.Skeleton />
			<ChannelMessage.Skeleton />
			<ChannelMessage.Skeleton />
		</>
	);
};