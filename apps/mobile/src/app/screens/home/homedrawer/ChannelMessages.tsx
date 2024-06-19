import { useChatMessage, useChatMessages, useChatReaction, useChatTypings } from '@mezon/core';
import { ArrowDownIcon } from '@mezon/mobile-components';
import { Colors, Metrics, size, useAnimatedState } from '@mezon/mobile-ui';
import { channelsActions, selectAttachmentPhoto, selectDataReactionGetFromMessage, useAppDispatch } from '@mezon/store-mobile';
import { updateEmojiReactionData } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Swing } from 'react-native-animated-spinkit';
import FastImage from 'react-native-fast-image';
import ImageView from 'react-native-image-view';
import { useSelector } from 'react-redux';
import MessageItem from './MessageItem';
import WelcomeMessage from './WelcomeMessage';
import { styles } from './styles';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: ChannelStreamMode;
};

const ChannelMessages = React.memo(({ channelId, channelLabel, type, mode }: ChannelMessagesProps) => {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const { typingUsers } = useChatTypings({ channelId, channelLabel, mode });
	const { markMessageAsSeen } = useChatMessage(unreadMessageId);
	const [showScrollToBottomButton, setShowScrollToBottomButton] = useAnimatedState(false);
	const flatListRef = useRef(null);
	const footerImagesModalRef = useRef(null);
	const timeOutRef = useRef(null);
	const attachments = useSelector(selectAttachmentPhoto());
	const [imageSelected, setImageSelected] = useState<ApiMessageAttachment>();
	const dispatch = useAppDispatch();

	const createAttachmentObject = (attachment: any) => ({
		source: {
			uri: attachment.url,
		},
		filename: attachment.filename,
		title: attachment.filename,
		width: Metrics.screenWidth,
		height: Metrics.screenHeight - 120,
		url: attachment.url,
		uri: attachment.url,
	});

	const formatAttachments: any[] = useMemo(() => {
		const imageSelectedUrl = imageSelected ? createAttachmentObject(imageSelected) : {};
		const attachmentObjects = attachments.filter((u) => u.url !== imageSelected?.url).map(createAttachmentObject);
		return [imageSelectedUrl, ...attachmentObjects];
	}, [attachments, imageSelected]);

	const [visibleImageModal, setVisibleImageModal] = useAnimatedState<boolean>(false);
	const [visibleImageModalOverlay, setVisibleImageModalOverlay] = useAnimatedState<boolean>(false);
	const [idxSelectedImageModal, setIdxSelectedImageModal] = useAnimatedState<number>(0);

	useEffect(() => {
		if (flatListRef.current) {
			flatListRef.current.scrollToEnd({ animated: true });
		}

		return () => {
			if (timeOutRef?.current) clearTimeout(timeOutRef.current);
		};
	}, []);

	const { dataReactionServerAndSocket } = useChatReaction();
	const reactDataFirstGetFromMessage = useSelector(selectDataReactionGetFromMessage);

	const dataReactionCombine = updateEmojiReactionData([...reactDataFirstGetFromMessage, ...dataReactionServerAndSocket]);

	const typingLabel = useMemo(() => {
		if (typingUsers.length === 1) {
			return `${typingUsers[0].user?.username} is typing...`;
		}
		if (typingUsers.length > 1) {
			return 'Several people are typing...';
		}
		return '';
	}, [typingUsers]);

	useEffect(() => {
		if (messages?.[0]) {
			const timestamp = Date.now() / 1000;
			markMessageAsSeen(messages?.[0]);
			dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId: messages?.[0].channel_id, timestamp }));
		}
	}, [markMessageAsSeen, messages]);

	const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
	const onLoadMore = () => {
		setIsLoadMore(true);
		loadMoreMessage().finally(() => setIsLoadMore(false));
	};

	const handleScroll = (event: { nativeEvent: { contentOffset: { y: any } } }) => {
		const offsetY = event.nativeEvent.contentOffset.y;
		const threshold = 300; // Adjust this value to determine when to show the button

		if (offsetY > threshold && !showScrollToBottomButton) {
			setShowScrollToBottomButton(true);
		} else if (offsetY <= threshold && showScrollToBottomButton) {
			setShowScrollToBottomButton(false);
		}
	};

	const scrollToBottom = () => {
		flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
	};

	const ViewLoadMore = () => {
		return (
			<View style={styles.loadMoreChannelMessage}>
				<ActivityIndicator size="large" color={Colors.tertiary} />
			</View>
		);
	};
	const onOpenImage = useCallback((image: ApiMessageAttachment) => {
		setImageSelected(image);
		setIdxSelectedImageModal(0);
		footerImagesModalRef?.current?.scrollToIndex({ animated: true, index: 0 });
		setVisibleImageModal(true);
	}, []);

	const renderItem = ({ item, index }) => {
		const preMessage = messages.length > index + 1 ? messages[index + 1] : undefined;
		return (
			<MessageItem
				message={item}
				mode={mode}
				channelId={channelId}
				dataReactionCombine={dataReactionCombine}
				channelLabel={channelLabel}
				preMessage={preMessage}
				onOpenImage={onOpenImage}
			/>
		);
	};

	const RenderFooterModal = () => {
		return (
			<View style={styles.wrapperFooterImagesModal}>
				<FlatList
					ref={footerImagesModalRef}
					horizontal
					data={formatAttachments}
					onScrollToIndexFailed={(info) => {
						const wait = new Promise((resolve) => setTimeout(resolve, 200));
						wait.then(() => {
							footerImagesModalRef.current?.scrollToIndex({ index: info.index, animated: true });
						});
					}}
					renderItem={({ item, index }) => (
						<TouchableOpacity
							activeOpacity={0.8}
							key={`${item.url}_${index}_ImagesModal`}
							onPress={() => {
								setVisibleImageModal(false);
								setVisibleImageModalOverlay(true);
								setIdxSelectedImageModal(index);
								timeOutRef.current = setTimeout(() => {
									setVisibleImageModal(true);
									setVisibleImageModalOverlay(false);
								}, 50);
							}}
						>
							<FastImage
								style={[styles.imageFooterModal, index === idxSelectedImageModal && styles.imageFooterModalActive]}
								source={{
									uri: item.url,
									priority: FastImage.priority.normal,
								}}
								resizeMode={FastImage.resizeMode.cover}
							/>
						</TouchableOpacity>
					)}
				/>
			</View>
		);
	};

	return (
		<View style={styles.wrapperChannelMessage}>
			{!messages?.length && <WelcomeMessage channelTitle={channelLabel} />}
			<FlatList
				ref={flatListRef}
				inverted
				data={messages || []}
				onScroll={handleScroll}
				keyboardShouldPersistTaps={'handled'}
				contentContainerStyle={styles.listChannels}
				renderItem={renderItem}
				keyExtractor={(item) => `${item?.id}`}
				maxToRenderPerBatch={5}
				initialNumToRender={5}
				windowSize={10}
				onEndReached={onLoadMore}
				onEndReachedThreshold={0.5}
				ListFooterComponent={isLoadMore && hasMoreMessage ? <ViewLoadMore /> : null}
			/>
			{showScrollToBottomButton && (
				<TouchableOpacity style={styles.btnScrollDown} onPress={scrollToBottom} activeOpacity={0.8}>
					<ArrowDownIcon color={Colors.tertiary} />
				</TouchableOpacity>
			)}
			{!!typingLabel && <Text style={styles.typingLabel}>{typingLabel}</Text>}
			{visibleImageModalOverlay && (
				<View style={styles.overlay}>
					<Swing size={size.s_34 * 2} color={Colors.bgViolet} />
				</View>
			)}
			<ImageView
				animationType={'fade'}
				images={formatAttachments}
				imageIndex={idxSelectedImageModal}
				isVisible={visibleImageModal}
				isSwipeCloseEnabled={false}
				onImageChange={(idx: number) => {
					setIdxSelectedImageModal(idx);
					timeOutRef.current = setTimeout(() => {
						footerImagesModalRef?.current?.scrollToIndex({ animated: true, index: idx });
					}, 200);
				}}
				controls={{
					next: true,
					prev: true,
					close: true,
				}}
				onClose={() => setVisibleImageModal(false)}
				renderFooter={() => <RenderFooterModal />}
			/>
		</View>
	);
});

export default ChannelMessages;
