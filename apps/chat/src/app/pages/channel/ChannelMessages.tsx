import { getJumpToMessageId, useChatMessages, useJumpToMessage, useReference } from '@mezon/core';
import React, { useRef, useState } from 'react';
import { ChannelMessage } from './ChannelMessage';
import useKeepScrollPosition from './useKeepScrollPosition';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

const ChannelMessages: React.FC<ChannelMessagesProps> = ({ channelId, channelLabel, type, avatarDM, mode }) => {
	const [messageIdToJump, setMessageIdToJump] = useState(getJumpToMessageId()); // Sửa lại tên biến để tuân thủ quy ước
	const [timeToJump, setTimeToJump] = useState(1000);
	const [positionToJump, setPositionToJump] = useState<ScrollLogicalPosition>('start');
	const { jumpToMessage } = useJumpToMessage();
	const { idMessageReplied } = useReference();
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });

	// const { messages, setLastMessageRef } = useMessages();
	const firstMessageRef = useRef<HTMLDivElement | null>(null);
	const [lastMessageRef, setLastMessageRef] = useState<HTMLDivElement | null>(null);
	// const isIntersecting = useOnScreen({ current: lastMessageRef });

	const { containerRef } = useKeepScrollPosition(messages);

	// useEffect(() => {
	// 	console.log(isIntersecting);
	// 	if (isIntersecting) {
	// 		loadMoreMessage();
	// 	}
	// }, [isIntersecting]);

	// useEffect(() => {
	// 	console.log(firstMessageRef);
	// 	if (firstMessageRef.current && setLastMessageRef) {
	// 		setLastMessageRef(firstMessageRef.current);
	// 	}
	// }, [setLastMessageRef, firstMessageRef]);

	const handleScroll = (e: any) => {
		console.log(e.target.scrollTop);
		if (e.target.scrollTop === 0 && hasMoreMessage) {
			loadMoreMessage();
		}
	};

	return (
		<div ref={containerRef} onScroll={handleScroll}>
			{messages.map((m: any, i: number) => {
				return (
					<div key={m.id}>
						<div>
							<ChannelMessage
								mode={mode}
								key={m.id}
								// lastSeen={m.id === unreadMessageId && message.id !== lastMessageId}
								message={m}
								preMessage={messages.length > 0 ? messages[i - 1] : undefined}
								channelId={channelId}
								channelLabel={channelLabel || ''}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default ChannelMessages;

// const {  unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });

// const fetchData = () => {
// 	loadMoreMessage();
// };

// useEffect(() => {
// 	fetchData();
// }, [channelId, fetchData]);

// <div
// 	className="bg-[#26262B] relative border border-green-300"
// 	// id="scrollLoading"
// 	ref={(ref) => (i === 0 ? setLastMessageRef(ref) : null)} // style={{
// 	// 	height: '100%',
// 	// 	overflowY: 'scroll',
// 	// 	display: 'flex',
// 	// 	flexDirection: 'column-reverse',
// 	// 	overflowX: 'hidden',
// 	// }}
// 	// onScroll={handleScroll} // Sửa lại sự kiện onScroll
// >
// 	{/* <ChatWelcome type={type} name={channelLabel} avatarDM={avatarDM} /> */}
// 	{messages.map((message, i) => (
// 		<ChannelMessage
// 			mode={mode}
// 			key={message.id}
// 			lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
// 			message={message}
// 			preMessage={messages.length > 0 ? messages[i - 1] : undefined}
// 			channelId={channelId}
// 			channelLabel={channelLabel || ''}
// 		/>
// 	))}
// </div>;

// const handleScroll = () => {
// 	if (containerRef.current) {
// 		setPosition(containerRef.current.scrollTop);
// 	}
// };

// ChannelMessages.Skeleton = () => {
// 	return (
// 		<>
// 			<ChannelMessage.Skeleton />
// 			<ChannelMessage.Skeleton />
// 			<ChannelMessage.Skeleton />
// 		</>
// 	);
// };

// const fetchData = () => {
// 	loadMoreMessage();
// };

// const containerRef = useRef<HTMLDivElement>(null);
// const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });

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

// useEffect(() => {
// 	let timeoutId: NodeJS.Timeout | null = null;
// 	if (messageIdToJump) {
// 		// Sửa lại điều kiện để kiểm tra messageIdToJump
// 		timeoutId = setTimeout(() => {
// 			jumpToMessage(messageIdToJump, positionToJump);
// 		}, timeToJump);
// 	}
// 	return () => {
// 		if (timeoutId) {
// 			clearTimeout(timeoutId);
// 		}
// 	};
// }, [messageIdToJump, jumpToMessage, positionToJump, timeToJump]);
