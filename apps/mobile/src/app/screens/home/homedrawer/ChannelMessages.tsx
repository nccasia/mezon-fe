import { ELoadMoreDirection } from '@mezon/chat-scroll';
import { ActionEmitEvent, load, save, STORAGE_CHANNEL_CURRENT_CACHE } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { selectAllMessagesByChannelId, useAppSelector } from '@mezon/store';
import { messagesActions, RootState, useAppDispatch } from '@mezon/store-mobile';
import { Direction_Mode } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import { useSelector } from 'react-redux';
import MessageItemSkeleton from '../../../components/Skeletons/MessageItemSkeleton';
import ChannelMessageList from './components/ChannelMessageList';
import { MessageUserTyping } from './components/MessageUserTyping';
import MessageItem from './MessageItem';
import { style } from './styles';
import { IMessageActionPayload } from './types';

type ChannelMessagesProps = {
	channelId: string;
	mode: ChannelStreamMode;
	onOpenImage?: (image: ApiMessageAttachment) => void;
	onMessageAction?: (payload: IMessageActionPayload) => void;
	setIsOnlyEmojiPicker?: (value: boolean) => void;
	isDM?: boolean;
	isPublic?: boolean;
};

const ChannelMessages = React.memo(
	({ channelId, mode, onOpenImage, onMessageAction, setIsOnlyEmojiPicker, isDM, isPublic }: ChannelMessagesProps) => {
		const dispatch = useAppDispatch();
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const messages = useAppSelector((state) => selectAllMessagesByChannelId(state, channelId));
		const isLoading = useSelector((state: RootState) => state?.messages?.loadingStatus);
		const [isShowSkeleton, setIsShowSkeleton] = React.useState<boolean>(true);
		const isLoadMore = useRef<boolean>(false);
		const [, setTriggerRender] = useState<boolean>(false);

		// const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
		const flatListRef = useRef(null);
		const timeOutRef = useRef(null);

		useEffect(() => {
			if (flatListRef.current) {
				flatListRef.current.scrollToEnd({ animated: true });
			}

			return () => {
				if (timeOutRef?.current) clearTimeout(timeOutRef.current);
			};
		}, []);

		useEffect(() => {
			const showSKlListener = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, ({ isShow }) => {
				setIsShowSkeleton(isShow);
			});
			return () => {
				showSKlListener.remove();
			};
		}, []);

		const jumpToRepliedMessage = useCallback(
			(messageId: string) => {
				const indexToJump = messages?.findIndex?.((message) => message.id === messageId);
				if (indexToJump !== -1 && flatListRef.current && indexToJump > 0) {
					flatListRef.current.scrollToIndex({ animated: true, index: indexToJump - 1 });
				}
			},
			[messages]
		);

		const onLoadMore = useCallback(
			async (direction: ELoadMoreDirection) => {
				if (isLoadMore.current) return;
				isLoadMore.current = true;
				setTriggerRender(true);
				if (direction === ELoadMoreDirection.bottom) {
					await dispatch(messagesActions.loadMoreMessage({ channelId, direction: Direction_Mode.AFTER_TIMESTAMP, fromMobile: true }));
					isLoadMore.current = false;
					setTriggerRender(false);
					return;
				}
				await dispatch(messagesActions.loadMoreMessage({ channelId, direction: Direction_Mode.BEFORE_TIMESTAMP, fromMobile: true }));
				isLoadMore.current = false;
				setTriggerRender(false);
				return true;
			},
			[dispatch, channelId]
		);

		// const handleScroll = useCallback(
		// 	(event: { nativeEvent: { contentOffset: { y: any } } }) => {
		// 		const offsetY = event.nativeEvent.contentOffset.y;
		// 		const threshold = 300; // Adjust this value to determine when to show the button
		// 		if (offsetY > threshold && showScrollToBottomButton) {
		// 			setShowScrollToBottomButton(false);
		// 		} else if (offsetY <= threshold && !showScrollToBottomButton) {
		// 			setShowScrollToBottomButton(true);
		// 		}
		//
		// 		if (offsetY <= 0) {
		// 			onLoadMore(ELoadMoreDirection.bottom);
		// 		}
		// 	},
		// 	[showScrollToBottomButton, onLoadMore]
		// );

		// const scrollToBottom = () => {
		// 	flatListRef.current.scrollToEnd({ animated: true });
		// };

		const renderItem = useCallback(
			({ item, index }) => {
				const previousMessage = messages?.[index + 1];
				return (
					<MessageItem
						jumpToRepliedMessage={jumpToRepliedMessage}
						message={item}
						previousMessage={previousMessage}
						messageId={item.id}
						mode={mode}
						channelId={channelId}
						onOpenImage={onOpenImage}
						onMessageAction={onMessageAction}
						setIsOnlyEmojiPicker={setIsOnlyEmojiPicker}
					/>
				);
			},
			[jumpToRepliedMessage, mode, channelId, onOpenImage, onMessageAction]
		);

		const checkChannelCacheLoading = useMemo(() => {
			let isCached = false;
			const channelsCache = load(STORAGE_CHANNEL_CURRENT_CACHE) || [];

			// have cached
			if (channelsCache?.includes(channelId)) {
				isCached = true;
			} else {
				save(STORAGE_CHANNEL_CURRENT_CACHE, [...channelsCache, channelId]);
			}
			return isCached;
		}, [channelId]);

		return (
			<View style={styles.wrapperChannelMessage}>
				{isLoading === 'loading' && !checkChannelCacheLoading && isShowSkeleton && !messages?.length && (
					<MessageItemSkeleton skeletonNumber={15} />
				)}

				<ChannelMessageList
					flatListRef={flatListRef}
					messages={messages}
					handleScroll={() => {
						// eslint-disable-next-line no-empty-function
					}}
					renderItem={renderItem}
					onLoadMore={onLoadMore}
					isLoadMore={isLoadMore.current}
				/>

				{/*{showScrollToBottomButton && (*/}
				{/*	<TouchableOpacity style={styles.btnScrollDown} onPress={scrollToBottom} activeOpacity={0.8}>*/}
				{/*		<Icons.ArrowLargeDownIcon color={themeValue.textStrong} height={20} width={20} />*/}
				{/*	</TouchableOpacity>*/}
				{/*)}*/}

				<MessageUserTyping channelId={channelId} isDM={isDM} isPublic={isPublic} mode={mode} />
			</View>
		);
	}
);

export default ChannelMessages;
