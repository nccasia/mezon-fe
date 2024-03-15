import { ChatWelcome } from '@mezon/components';
import { useAuth, useChatMessages } from '@mezon/core';
import { useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelName?: string;
	avatarDM?: string;
};

export default function ChannelMessages({ channelId, channelName, type, avatarDM }: ChannelMessagesProps) {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const { userProfile } = useAuth();
	const containerRef = useRef<HTMLDivElement>(null);

	const fetchData = () => {
		loadMoreMessage();
	};

	const goBottom = () => {
		if (containerRef.current !== null) {
			containerRef.current.scrollTo({ top: 10, behavior: 'smooth' });
		}
	};

	useEffect(() => {
		if (messages.length > 0 && messages[0].user?.id === userProfile?.user?.id) {
			goBottom();
		}
	}, [messages[0]]);

	return (
		<div
			className="z-0 border border-blue-500 overflow-x-hidden"
			id="scrollLoading"
			ref={containerRef}
			style={{
				height: '100%',
				overflowY: 'scroll',
				display: 'flex',
				flexDirection: 'column-reverse',
				overflowX: 'hidden',
				zIndex: 0,
			}}
		>
			<InfiniteScroll
				dataLength={messages.length}
				next={fetchData}
				style={{ display: 'flex', flexDirection: 'column-reverse', overflowX: 'hidden' }}
				inverse={true}
				hasMore={hasMoreMessage}
				loader={<h4 className="h-[50px] py-[18px] text-center">Loading...</h4>}
				scrollableTarget="scrollLoading"
				refreshFunction={fetchData}
				endMessage={<ChatWelcome type={type} name={channelName} avatarDM={avatarDM} />}
				pullDownToRefresh={containerRef.current !== null && containerRef.current.scrollHeight > containerRef.current.clientHeight}
				pullDownToRefreshThreshold={50}
			>
				{messages.map((message, i) => (
					<ChannelMessage
						key={message.id}
						lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
						message={message}
						preMessage={i < messages.length - 1 ? messages[i + 1] : undefined}
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
