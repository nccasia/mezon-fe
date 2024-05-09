import { useChatMessages } from '@mezon/core';
import { fetchMessages, useAppDispatch } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';
import { QueryClient, useInfiniteQuery } from 'react-query';
import { ChannelMessage } from './ChannelMessage';

const queryClient = new QueryClient();

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage, currentLastLoadMessage } = useChatMessages({ channelId });

	const dispatch = useAppDispatch();
	const fetchServerPage = () => {
		return dispatch(fetchMessages({ channelId: channelId, noCache: false, messageId: currentLastLoadMessage, direction: 3 }));
	};

	const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery(
		'chatMessages',
		() => fetchServerPage(),
		{
			getNextPageParam: (_lastGroup, groups) => {
				return groups.length;
			},
		},
	);

	const allRows = data ? data.pages.flatMap((d) => d.payload) : [];
	const containerRef = useRef<HTMLDivElement>(null);
	const rowVirtualizer = useVirtualizer({
		count: hasNextPage ? allRows.length + 1 : allRows.length,
		getScrollElement: () => containerRef.current,
		estimateSize: () => 100,
		overscan: 5,
	});
	useEffect(() => {
		const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

		if (!lastItem) {
			return;
		}

		if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);

	return (
		<div ref={containerRef} style={{ overflowY: 'auto', height: window.innerHeight, width: '100%' }}>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative',
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const message = allRows[virtualRow.index] as IMessageWithUser;
					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={rowVirtualizer.measureElement}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
								display: 'flex',
							}}
						>
							<div style={{ width: '100%' }}>
								<ChannelMessage
									mode={mode}
									key={message?.id}
									lastSeen={message?.id === unreadMessageId && message?.id !== lastMessageId}
									message={message}
									preMessage={messages.length > 0 ? messages[virtualRow.index - 1] : undefined}
									channelId={channelId}
									channelLabel={channelLabel || ''}
								/>
							</div>
						</div>
					);
				})}
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

