import { ChatWelcome } from '@mezon/components';
import { getJumpToMessageId, useApp, useChatMessages, useChatReaction, useJumpToMessage, useMessages, useReference } from '@mezon/core';
import { IMessageWithUser } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import { ChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const chatRef = useRef<HTMLDivElement>(null);

	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const [messageid, setMessageIdToJump] = useState(getJumpToMessageId());
	const [timeToJump, setTimeToJump] = useState(1000);
	const [positionToJump, setPositionToJump] = useState<ScrollLogicalPosition>('start');
	const { jumpToMessage } = useJumpToMessage();
	const { idMessageReplied } = useReference();
	const { appearanceTheme } = useApp();

	// share logic to load more message
	const isFetching = useMessages({ chatRef, hasMoreMessage, loadMoreMessage, messages, channelId });

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

	function reverseArray(array: IMessageWithUser[]) {
		return array.slice().reverse();
	}
	const { reactionBottomState } = useChatReaction();
	const { messageMatchWithRefStatus, positionOfSmileButton } = useChatReaction();
	return (
		<div
			className={`dark:bg-bgPrimary pb-5
			bg-bgLightModeSecond
			relative h-full overflow-y-scroll
			overflow-x-hidden flex-col flex
			
			${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
			id="scrollLoading"
			ref={chatRef}
		>
			{!hasMoreMessage && <ChatWelcome type={type} name={channelLabel} avatarDM={avatarDM} />}
			{isFetching && hasMoreMessage && <p className=" text-center">Loading messages...</p>}

			{reverseArray(messages).map((message, i) => {
				return (
					<ChannelMessage
						mode={mode}
						key={message.id}
						lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
						message={message}
						preMessage={reverseArray(messages).length > 0 ? reverseArray(messages)[i - 1] : undefined}
						channelId={channelId}
						channelLabel={channelLabel ?? ''}
					/>
				);
			})}
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
