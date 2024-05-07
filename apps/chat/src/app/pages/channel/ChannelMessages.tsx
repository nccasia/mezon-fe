import { ChatWelcome } from '@mezon/components';
import { useChatMessages } from '@mezon/core';
import { useEffect, useRef, useState } from 'react';
import { ChannelMessage } from './ChannelMessage';
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const [isLoading, setIsLoading] = useState(false)
	const fetchData = async () => {
		setIsLoading(true)
		const res = await loadMoreMessage();
		setIsLoading(false)
	};

	function setRowHeight(index: any, size: any) {
		listRef.current.resetAfterIndex(0);
		rowHeights.current = { ...rowHeights.current, [index]: size };
	}

	function scrollToBottom() {
		if (listRef.current) {
			if (messages.length > 50) {
				listRef.current?.scrollToItem(60, "end");
			} else {
				listRef.current?.scrollToItem(messages.length, "end");
			}
		}
	}

	const listRef = useRef<any>({});
	const rowHeights = useRef<any>({});

	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages.length]);

	function getRowHeight(index: any) {
		return rowHeights.current[index] || 60;
	}

	function Row({ index, style }: any) {
		const rowRef = useRef<any>({});
		useEffect(() => {
			if (rowRef.current) {
				if (messages[index].attachments?.length) {
					rowRef.current.clientHeight > 40 ? setRowHeight(index, rowRef.current.clientHeight) : setRowHeight(index, 100)
				}
				else {
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

	// const handleScroll = (e: any) => {
	// 	setPosition(e.target.scrollTop);
	// };

	const handleScroll = (e: any) => {
		const { scrollTop } = e.target;
		const scrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
		scrollPositions[channelId] = { scrollTop }; // Lưu kích thước thanh cuộn cho kênh hiện tại
		console.log(scrollPositions[channelId]);
		sessionStorage.setItem(`scrollPositions_${channelId}`, JSON.stringify(scrollPositions));


	const onScroll = ({ scrollOffset }: any) => {
		if (scrollOffset < 50 && hasMoreMessage && messages.length > 49) {
			loadMoreMessage();
		}
	};
	
	useEffect(() => {
		const scrollPositions = JSON.parse(sessionStorage.getItem(`scrollPositions_${channelId}`) || '{}');
		const savedScroll = scrollPositions[channelId];
		if (savedScroll) {
			const { scrollTop } = savedScroll;
			window.scrollTo(0, scrollTop);
		}
	}, [channelId]);

	return (
		<div
			className="bg-[#26262B] relative"
			style={{
				height: '100%',
				display: 'flex',
				overflowX: 'hidden',
			}}
			onScroll={handleScroll}
		>
			<AutoSizer>
				{({ height, width }) => (
					<List
						height={height - 15}
						itemCount={messages.length}
						itemSize={getRowHeight}
						ref={listRef}
						width={width}
						onScroll={onScroll}
						initialScrollOffset={10000}
					>
						{Row}
					</List>
				)}
			</AutoSizer>
		</div>
	);
}

// ChannelMessages.Skeleton = () => {
// 	return (
// 		<>
// 			<ChannelMessage.Skeleton />
// 			<ChannelMessage.Skeleton />
// 			<ChannelMessage.Skeleton />
// 		</>
// 	);
// };
