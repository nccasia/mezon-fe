import { getJumpToMessageId, useApp, useChatMessages, useJumpToMessage, useMessages, useNotification, useReference } from '@mezon/core';
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
	const [positionToJump, setPositionToJump] = useState<ScrollLogicalPosition>('center');
	const { jumpToMessage } = useJumpToMessage();
	const { setIdReferenceMessageReply, idMessageRefReply, idMessageToJump } = useReference();
	const { appearanceTheme } = useApp();
	const { idMessageNotifed, setMessageNotifedId } = useNotification();

	// share logic to load more message
	const { isFetching, showLoadingMessage } = useMessages({ chatRef, hasMoreMessage, loadMoreMessage, messages, channelId });
	console.log(showLoadingMessage);
	useEffect(() => {
		if (idMessageNotifed || idMessageNotifed === '') setMessageIdToJump(idMessageNotifed);
		if (idMessageRefReply !== '') setMessageIdToJump(idMessageRefReply);
		if (idMessageToJump !== '') setMessageIdToJump(idMessageToJump);
		setTimeToJump(0);
		setPositionToJump('center');
	}, [getJumpToMessageId, idMessageNotifed, idMessageRefReply, idMessageToJump]);

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

	console.log('hasMoreMessage', hasMoreMessage);
	return (
		<div
			className={`dark:bg-bgPrimary pb-5
			bg-bgLightPrimary
			relative h-full overflow-y-scroll
			overflow-x-hidden flex-col flex

			${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
			id="scrollLoading"
			ref={chatRef}
		>
			{/* {hasMoreMessage && <ChatWelcome type={type} name={channelLabel} avatarDM={avatarDM} />} */}
			{showLoadingMessage && <p className=" text-center">Loading messages...</p>}

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
