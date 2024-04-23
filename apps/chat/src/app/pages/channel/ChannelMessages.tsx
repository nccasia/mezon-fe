import { ChatWelcome } from '@mezon/components';
import { getJumpToMessageId, useChatMessages, useJumpToMessage, useReference } from '@mezon/core';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const containerRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState(containerRef.current?.scrollTop || 0);
	const { idMessageReplied } = useReference();
	const fetchData = () => {
		loadMoreMessage();
	};

	const [messageid, setMessageIdToJump] = useState(getJumpToMessageId());
	const [timeToJump, setTimeToJump] = useState(1000);
	const [positionToJump, setPositionToJump] = useState<ScrollLogicalPosition>('start');

	// useEffect(() => {
	// 	if (idMessageReplied) {
	// 		setMessageIdToJump(idMessageReplied);
	// 		setTimeToJump(0);
	// 		setPositionToJump('center');
	// 	} else {
	// 		setMessageIdToJump(getJumpToMessageId());
	// 		setTimeToJump(1000);
	// 		setPositionToJump('start');
	// 	}
	// }, [getJumpToMessageId, idMessageReplied]);

	// const { jumpToMessage } = useJumpToMessage();

	// useEffect(() => {
	// 	let timeoutId: NodeJS.Timeout | null = null;
	// 	if (messageid) {
	// 		timeoutId = setTimeout(() => {
	// 			jumpToMessage(messageid, positionToJump);
	// 		}, timeToJump);
	// 	}
	// 	return () => {
	// 		if (timeoutId) {
	// 			clearTimeout(timeoutId);
	// 		}
	// 	};
	// }, [messageid, jumpToMessage]);

	const handleScroll = (e: any) => {
		setPosition(e.target.scrollTop);
	};

	return (
		<div
			className="bg-[#26262B] relative"
			id="scrollLoading"
			ref={containerRef}
			style={{
				height: '100%',
				overflowY: 'scroll',
				display: 'flex',
				flexDirection: 'column-reverse',
				overflowX: 'hidden',
			}}
		>
			<InfiniteScroll
				dataLength={messages.length}
				next={fetchData}
				style={{ display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}
				inverse={true}
				hasMore={hasMoreMessage}
				loader={<h4 className="h-[50px] py-[18px] text-center">Loading...</h4>}
				scrollableTarget="scrollLoading"
				refreshFunction={fetchData}
				pullDownToRefresh={containerRef.current !== null && containerRef.current.scrollHeight > containerRef.current.clientHeight}
				pullDownToRefreshThreshold={50}
				onScroll={handleScroll}
			>
				<ChatWelcome type={type} name={channelLabel} avatarDM={avatarDM} />

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
			</InfiniteScroll>
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
