import { useChatMessages } from '@mezon/core';
import { useVirtualizer } from '@mezon/virtual';
import { useCallback, useEffect, useRef } from 'react';
import { ChannelMessage } from './ChannelMessage';

const INFINE_SCROLL_THRESHOLD_PX = 200;

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const { messages, isLoading, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });

	const parentRef = useRef<any>();

	const rowVirtualizer = useVirtualizer({
		count: hasMoreMessage ? messages.length + 1 : messages.length,
		estimateSize: () => 100,
		getScrollElement: () => parentRef.current,
		reverse: true,
	});

	// called on scroll and possibly on mount to fetch more data as the user scrolls and reaches top of conversation
	const handleOnScroll = useCallback(() => {
		const { scrollHeight, scrollTop, clientHeight } = parentRef.current;
		const scrollOffsetTop =  scrollHeight - clientHeight + scrollTop;
		const shouldLoadMore = scrollOffsetTop < INFINE_SCROLL_THRESHOLD_PX;
		if (shouldLoadMore && hasMoreMessage && !isLoading) {
			loadMoreMessage();
		}
	}, [hasMoreMessage, isLoading, loadMoreMessage]);


	return (
		<div
			className="bg-bgPrimary relative"
			style={{
				height: '100%',
				display: 'flex',
				overflowX: 'hidden',
			}}
		>
			<div
				ref={parentRef}
				className="List"
				onScroll={handleOnScroll}
				style={{
					display: 'flex',
					flexDirection: 'column-reverse',
					justifyContent: 'flex-start',
					minHeight: '0',
					overflow: 'auto',
					width: '100%',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column-reverse',
						flexShrink: '0',
						height: `${rowVirtualizer.getTotalSize()}px`,
						justifyContent: 'flex-start',
						marginBottom: 'auto',
						position: 'relative',
						width: '100%',
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const isLoaderRow = virtualRow.index === messages.length;
						const message = messages[virtualRow.index];
						const hasAttachment = (message?.attachments?.length ?? 0) > 0;
						const minHeight = hasAttachment ? '200px' : 'auto';
						return (
							<div
								ref={virtualRow.measureElement}
								key={virtualRow.index}
								style={{
									position: 'absolute',
									bottom: 0,
									left: 0,
									width: '100%',
									transform: `translateY(${virtualRow.end}px)`,
								}}
							>
								<div
									style={{
										height: isLoaderRow ? '100px' : 'auto',
										minHeight,
									}}
								>
									{isLoaderRow ? (
										hasMoreMessage ? (
											'Loading more...'
										) : (
											'Nothing more to load'
										)
									) : (
										<ChannelMessage
											mode={mode}
											lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
											message={message}
											// workaround for now, preMessage = messages[virtualRow.index + 1] because we are using reverse
											preMessage={messages[virtualRow.index + 1] || null}
											channelId={channelId}
											channelLabel={channelLabel || ''}
										/>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
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
