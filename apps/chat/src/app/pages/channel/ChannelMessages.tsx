import { ChatWelcome, GifStickerEmojiPopup } from '@mezon/components';
import { getJumpToMessageId, useAuth, useChatMessages, useJumpToMessage } from '@mezon/core';
import { channelsActions, emojiActions,  selectArrayNotification, useAppDispatch } from '@mezon/store';
import { NotificationContent, TabNamePopup } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
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
	const [heightEditor, setHeightEditor] = useState(30);
	// const activeGifsStickerEmojiTab = useSelector(selectActiceGifsStickerEmojiTab);

	const dispatch = useAppDispatch();
	const arrayNotication = useSelector(selectArrayNotification);

	const fetchData = () => {
		loadMoreMessage();
	};
	const messageid = getJumpToMessageId();

	const { jumpToMessage } = useJumpToMessage();

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null;
		if (messageid) {
			timeoutId = setTimeout(() => {
				jumpToMessage(messageid);
			}, 1000);
		}
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [messageid, jumpToMessage]);

	const [popupClass, setPopupClass] = useState('fixed right-[1rem] z-10');

	useEffect(() => {
		setPopupClass(`fixed right-[1rem] bottom-[${heightEditor + 20}px] z-10`);
	}, [heightEditor]);

	const handleScroll = (e: any) => {
		setPosition(e.target.scrollTop);
	};

	useEffect(() => {
		const notificationLength = arrayNotication.length;
		const notification = arrayNotication[notificationLength - 1]?.content as NotificationContent;
		const timestamp = notification.update_time?.seconds || '';
		const channelIdNotification = notification.channel_id;
		if (position && position >= 0) {
			dispatch(channelsActions.setTimestamp({ channelId: channelIdNotification, timestamp: String(timestamp) }));
			dispatch(channelsActions.setChannelLastSeenMessageId({ channelId, channelLastSeenMesageId: messages[0].id }));
			dispatch(channelsActions.setChannelLastSentMessageId({ channelId, channelLastSentMessageId: messages[0].id }));
		}
	}, [arrayNotication, dispatch, position]);

	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				// dispatch(emojiActions.setActiveGifsStickerEmojiTab(TabNamePopup.NONE));
			}}
			className=" relative"
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
				style={{ display: 'flex', flexDirection: 'column-reverse', overflowX: 'hidden' }}
				inverse={true}
				hasMore={hasMoreMessage}
				loader={<h4 className="h-[50px] py-[18px] text-center">Loading...</h4>}
				scrollableTarget="scrollLoading"
				refreshFunction={fetchData}
				endMessage={<ChatWelcome type={type} name={channelLabel} avatarDM={avatarDM} />}
				pullDownToRefresh={containerRef.current !== null && containerRef.current.scrollHeight > containerRef.current.clientHeight}
				pullDownToRefreshThreshold={50}
				onScroll={handleScroll}
			>
				{messages.map((message, i) => (
					<ChannelMessage
						mode={mode}
						key={message.id}
						lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
						message={message}
						preMessage={i < messages.length - 1 ? messages[i + 1] : undefined}
						channelId={channelId}
						channelLabel={channelLabel || ''}
					/>
				))}
			</InfiniteScroll>
			{/* {activeGifsStickerEmojiTab !== TabNamePopup.NONE && ( */}
				<div
					className={popupClass}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<GifStickerEmojiPopup />
				</div>
			{/* )} */}
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
