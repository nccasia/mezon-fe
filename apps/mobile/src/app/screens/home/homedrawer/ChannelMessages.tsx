import { ELoadMoreDirection } from '@mezon/chat-scroll';
import { ActionEmitEvent, Icons, load, save, STORAGE_CHANNEL_CURRENT_CACHE } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import {
	selectHasMoreBottomByChannelId,
	selectHasMoreMessageByChannelId,
	selectIdMessageToJump,
	selectIsMessageIdExist,
	selectIsViewingOlderMessagesByChannelId,
	selectMessageIsLoading,
	selectMessagesByChannel
} from '@mezon/store';
import { messagesActions, RootState, useAppDispatch, useAppSelector } from '@mezon/store-mobile';
import { Direction_Mode, LIMIT_MESSAGE } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, LayoutAnimation, Platform, TouchableOpacity, UIManager, View } from 'react-native';
import { useSelector } from 'react-redux';
import MessageItemSkeleton from '../../../components/Skeletons/MessageItemSkeleton';
import ChannelMessageList from './components/ChannelMessageList';
import { MessageUserTyping } from './components/MessageUserTyping';
import MessageItem from './MessageItem';
import { style } from './styles';
import { IMessageActionPayload } from './types';

type ChannelMessagesProps = {
	channelId: string;
	clanId: string;
	mode: ChannelStreamMode;
	onOpenImage?: (image: ApiMessageAttachment) => void;
	onMessageAction?: (payload: IMessageActionPayload) => void;
	setIsOnlyEmojiPicker?: (value: boolean) => void;
	isDM?: boolean;
	isPublic?: boolean;
};

const getEntitiesArray = (state: any) => {
	if (!state?.ids) return [];
	return state.ids.map((id) => state?.entities?.[id])?.reverse();
};

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const ChannelMessages = React.memo(
	({ channelId, clanId, mode, onOpenImage, onMessageAction, setIsOnlyEmojiPicker, isDM, isPublic }: ChannelMessagesProps) => {
		const dispatch = useAppDispatch();
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const selectMessagesByChannelMemoized = useAppSelector((state) => selectMessagesByChannel(state, channelId));
		const messages = useMemo(() => getEntitiesArray(selectMessagesByChannelMemoized), [selectMessagesByChannelMemoized]);
		const isLoading = useSelector((state: RootState) => state?.messages?.loadingStatus);
		const [isShowSkeleton, setIsShowSkeleton] = React.useState<boolean>(true);
		const isLoadMore = useRef({});
		const [, setTriggerRender] = useState<boolean>(false);
		const isFetching = useSelector(selectMessageIsLoading);
		const hasMoreTop = useSelector(selectHasMoreMessageByChannelId(channelId));
		const hasMoreBottom = useSelector(selectHasMoreBottomByChannelId(channelId));
		const isViewingOldMessage = useSelector(selectIsViewingOlderMessagesByChannelId(channelId ?? ''));
		const idMessageToJump = useSelector(selectIdMessageToJump);
		const isMessageExist = useSelector(selectIsMessageIdExist(channelId, idMessageToJump));

		const flatListRef = useRef(null);
		const timeOutRef = useRef(null);

		useEffect(() => {
			const event = DeviceEventEmitter.addListener(ActionEmitEvent.SCROLL_TO_BOTTOM_CHAT, () => {
				if (!isViewingOldMessage && !hasMoreBottom) {
					flatListRef?.current?.scrollToOffset?.({ animated: true, offset: 0 });
				}
			});

			return () => {
				if (timeOutRef?.current) clearTimeout(timeOutRef.current);
				event.remove();
			};
		}, [hasMoreBottom, isViewingOldMessage]);

		useEffect(() => {
			const showSKlListener = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, ({ isShow }) => {
				setIsShowSkeleton(isShow);
			});
			return () => {
				showSKlListener.remove();
			};
		}, []);

		useEffect(() => {
			if (idMessageToJump && isMessageExist) {
				const indexToJump = messages?.findIndex?.((message: { id: string }) => message.id === idMessageToJump);
				if (indexToJump !== -1 && flatListRef.current && indexToJump > 0 && messages?.length - 1 >= indexToJump) {
					const offsetBefore = flatListRef.current?.state.layoutProvider.getLayoutManager()?.getOffsetForIndex(indexToJump);
					if (offsetBefore) {
						flatListRef?.current?.scrollToOffset?.({ animated: true, offset: offsetBefore?.y });
					} else {
						flatListRef?.current?.scrollToIndex?.({ animated: true, index: indexToJump });
					}
				}
			}
		}, [dispatch, idMessageToJump, isMessageExist, messages]);

		const scrollChannelMessageToIndex = (index: number) => {
			if (flatListRef.current) {
				const offsetBefore = flatListRef.current?.state.layoutProvider.getLayoutManager()?.getOffsetForIndex(index);
				timeOutRef.current = setTimeout(() => {
					flatListRef?.current?.scrollToOffset?.({ animated: true, offset: offsetBefore?.y });
				}, 300);
			}
		};

		const onLoadMore = useCallback(
			async (direction: ELoadMoreDirection) => {
				if (isLoadMore?.current?.[direction] || isFetching) return;
				if (direction === ELoadMoreDirection.bottom && !hasMoreBottom) {
					return;
				}
				if (direction === ELoadMoreDirection.top && !hasMoreTop) {
					return;
				}
				LayoutAnimation.configureNext({
					duration: 200,
					create: {
						type: LayoutAnimation.Types.easeInEaseOut,
						property: LayoutAnimation.Properties.opacity
					},
					update: {
						type: LayoutAnimation.Types.easeInEaseOut
					}
				});
				isLoadMore.current[direction] = true;
				setTriggerRender(true);
				if (direction === ELoadMoreDirection.bottom) {
					await dispatch(
						messagesActions.loadMoreMessage({ clanId, channelId, direction: Direction_Mode.AFTER_TIMESTAMP, fromMobile: true })
					);
					isLoadMore.current[direction] = false;
					setTriggerRender(false);
					if (messages?.length >= LIMIT_MESSAGE * 4) {
						scrollChannelMessageToIndex(LIMIT_MESSAGE);
					}
					return;
				}
				await dispatch(messagesActions.loadMoreMessage({ clanId, channelId, direction: Direction_Mode.BEFORE_TIMESTAMP, fromMobile: true }));
				isLoadMore.current[direction] = false;
				setTriggerRender(false);
				// if (messages?.length >= LIMIT_MESSAGE * 4) {
				// 	scrollChannelMessageToIndex(LIMIT_MESSAGE * 3);
				// }

				return true;
			},
			[isFetching, hasMoreBottom, hasMoreTop, dispatch, clanId, channelId, messages?.length]
		);

		const renderItem = useCallback(
			({ item, index }) => {
				const previousMessage = messages?.[index + 1];
				return (
					<MessageItem
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
			[messages, mode, channelId, onOpenImage, onMessageAction, setIsOnlyEmojiPicker]
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

		const handleJumpToPresent = useCallback(async () => {
			// Jump to present
			await dispatch(messagesActions.fetchMessages({ clanId, channelId, isFetchingLatestMessages: true, noCache: true, isClearMessage: true }));
			await dispatch(messagesActions.setIdMessageToJump(null));
			timeOutRef.current = setTimeout(() => {
				flatListRef?.current?.scrollToOffset?.({ animated: true, offset: 0 });
			}, 200);
		}, [clanId, channelId, dispatch]);

		return (
			<View style={styles.wrapperChannelMessage}>
				{isLoading === 'loading' && !checkChannelCacheLoading && isShowSkeleton && !messages?.length && (
					<MessageItemSkeleton skeletonNumber={15} />
				)}

				<ChannelMessageList
					flatListRef={flatListRef}
					messages={messages}
					handleScroll={async ({ nativeEvent }) => {
						if (nativeEvent.contentOffset.y <= 0) {
							await onLoadMore(ELoadMoreDirection.bottom);
						}
					}}
					renderItem={renderItem}
					onLoadMore={onLoadMore}
					isLoadMoreTop={isLoadMore.current?.[ELoadMoreDirection.top]}
					isLoadMoreBottom={isLoadMore.current?.[ELoadMoreDirection.bottom]}
				/>
				<Block height={size.s_8} />
				{(isViewingOldMessage || hasMoreBottom) && (
					<TouchableOpacity style={styles.btnScrollDown} onPress={handleJumpToPresent} activeOpacity={0.8}>
						<Icons.ArrowLargeDownIcon color={themeValue.textStrong} height={size.s_20} width={size.s_20} />
					</TouchableOpacity>
				)}

				<MessageUserTyping channelId={channelId} isDM={isDM} isPublic={isPublic} mode={mode} />
			</View>
		);
	}
);

export default ChannelMessages;
