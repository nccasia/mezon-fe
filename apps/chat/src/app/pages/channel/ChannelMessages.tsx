import { useChatMessages } from '@mezon/core';
import { useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
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

	const listRef = useRef<any>({});
	const rowHeights = useRef<any>({});
	const [scrollPosition, setScrollPosition] = useState<{ [key: string]: number }>({});

	useEffect(() => {
		// TODO: May find another solution instead of delay to get ref
		setTimeout(() => {
			if (messages.length > 0) {
				// retrieve the last scroll position of the channel
				const lastPosition = scrollPosition[channelId];
				if (lastPosition !== undefined) {
					listRef.current?.scrollTo(lastPosition);
				} else {
					listRef.current?.scrollToItem(messages.length - 1);
				}
			}
		}, 100);
	}, [messages.length]);

	function getRowHeight(index: any) {
		return rowHeights.current[index] || 60;
	}

	function Row({ index, style }: any) {
		const rowRef = useRef<any>({});
		useEffect(() => {
			if (rowRef.current) {
				if (messages[index].attachments?.length) {
					rowRef.current.clientHeight > 40 ? setRowHeight(index, rowRef.current.clientHeight) : setRowHeight(index, 100);
				} else {
					const newHeight = rowRef.current.clientHeight;
					setRowHeight(index, newHeight);
				}
			}
		}, [rowRef.current]);
		return (
			<div style={style} key={messages[index].id}>
				<div ref={rowRef}>
					<ChannelMessage
						mode={mode}
						lastSeen={messages[index].id === unreadMessageId && messages[index].id !== lastMessageId}
						message={messages[index]}
						preMessage={messages.length > 0 ? messages[index - 1] : undefined}
						channelId={channelId}
						channelLabel={channelLabel || ''}
					/>
				</div>
			</div>
		);
	}

	function setRowHeight(index: any, size: any) {
		listRef.current.resetAfterIndex(0);
		rowHeights.current = { ...rowHeights.current, [index]: size };
	}

	const onScroll = ({ scrollOffset }: any) => {
		setTimeout(() => {
			setScrollPosition((prev) => ({
				...prev,
				[channelId]: scrollOffset,
			}));
		}, 500);

		if (scrollOffset < 50 && hasMoreMessage && messages.length > 49) {
			loadMoreMessage();
		}
	};

	return (
		<div
			className="bg-[#26262B] relative"
			style={{
				height: '100%',
				display: 'flex',
				overflowX: 'hidden',
			}}
		>
			<AutoSizer>
				{({ height, width }) => (
					<List height={height - 15} itemCount={messages.length} itemSize={getRowHeight} ref={listRef} width={width} onScroll={onScroll}>
						{Row}
					</List>
				)}
			</AutoSizer>
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
