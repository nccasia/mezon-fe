import { useChatMessages } from '@mezon/core';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
};
export default function ChannelMessages({ channelId }: ChannelMessagesProps) {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const fetchData = () => {
		//call api
		loadMoreMessage();
	};
	// console.log('HasMore: ', lastMessageId, unreadMessageId, messages.map(item => item.id))
	return (
		<div
			id="scrollableDiv"
			style={{
				height: '100%',
				overflowY: 'auto',
				display: 'flex',
				flexDirection: 'column-reverse',
			}}
		>
			<InfiniteScroll
				dataLength={messages.length}
				next={fetchData}
				style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
				inverse={true} //
				hasMore={hasMoreMessage}
				loader={<h4 className="h-[50px] py-[18px] text-center">Loading...</h4>}
				scrollableTarget="scrollableDiv"
				// below props only if you need pull down functionality
				refreshFunction={fetchData}
				pullDownToRefresh
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
