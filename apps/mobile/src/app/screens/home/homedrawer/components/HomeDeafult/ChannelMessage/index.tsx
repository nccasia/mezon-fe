import { useChatMessages, useChatTypings } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { Colors, Metrics, size, useAnimatedState, useTheme } from '@mezon/mobile-ui';
import {
	RootState,
	selectAllUserClanProfile,
	selectAttachmentPhoto,
	selectCurrentClan,
	selectHasMoreMessageByChannelId,
	selectMembersByChannelId,
	selectMessageIdsByChannelId,
	useAppDispatch,
} from '@mezon/store-mobile';
import { cloneDeep } from 'lodash';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { useSelector } from 'react-redux';
import { ImageListModal } from '../../../../../../components/ImageListModal';
import MessageItem from '../MessageItem';
import WelcomeMessage from '../WelcomeMessage';
import MessageItemSkeleton from '../../../../../../components/Skeletons/MessageItemSkeleton';
import { style } from './styles';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: ChannelStreamMode;
};

const ChannelMessages = React.memo(({ channelId, channelLabel, type, mode }: ChannelMessagesProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { loadMoreMessage } = useChatMessages({ channelId });
	const messages = useSelector((state) => selectMessageIdsByChannelId(state, channelId));
	const isLoading = useSelector((state: RootState) => state?.messages?.loadingStatus);
	const { typingUsers } = useChatTypings({ channelId, mode });
	const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
	const flatListRef = useRef(null);
	const timeOutRef = useRef(null);
	const attachments = useSelector(selectAttachmentPhoto());
	const hasMoreMessage = useSelector(selectHasMoreMessageByChannelId(channelId));
	const [imageSelected, setImageSelected] = useState<ApiMessageAttachment>();
	const dispatch = useAppDispatch();
	const currentClan = useSelector(selectCurrentClan);
	const channelMember = useSelector(selectMembersByChannelId(channelId));
	const clansProfile = useSelector(selectAllUserClanProfile);

	const createAttachmentObject = (attachment: any) => ({
		source: {
			uri: attachment.url,
		},
		filename: attachment.filename,
		title: attachment.filename,
		width: Metrics.screenWidth,
		height: Metrics.screenHeight - 150,
		url: attachment.url,
		uri: attachment.url,
		uploader: attachment.uploader,
		create_time: attachment.create_time,
	});

	const formatAttachments: any[] = useMemo(() => {
		const imageSelectedUrl = imageSelected ? createAttachmentObject(imageSelected) : {};
		const attachmentObjects = attachments.filter((u) => u.url !== imageSelected?.url).map(createAttachmentObject);
		return [imageSelectedUrl, ...attachmentObjects];
	}, [attachments, imageSelected]);

	const [visibleImageModal, setVisibleImageModal] = useState<boolean>(false);
	const [visibleImageModalOverlay, setVisibleImageModalOverlay] = useState<boolean>(false);
	const [idxSelectedImageModal, setIdxSelectedImageModal] = useAnimatedState<number>(0);

	useEffect(() => {
		if (flatListRef.current) {
			flatListRef.current.scrollToEnd({ animated: true });
		}

		return () => {
			if (timeOutRef?.current) clearTimeout(timeOutRef.current);
		};
	}, []);

	const typingLabel = useMemo(() => {
		if (typingUsers?.length === 1) {
			return `${typingUsers?.[0]?.user?.username} is typing...`;
		}
		if (typingUsers?.length > 1) {
			return 'Several people are typing...';
		}
		return '';
	}, [typingUsers]);

	const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
	const onLoadMore = () => {
		setIsLoadMore(true);
		if (!isLoadMore) loadMoreMessage().finally(() => setIsLoadMore(false));
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
	const onOpenImage = useCallback(
		(image: ApiMessageAttachment) => {
			setImageSelected(image);
			setIdxSelectedImageModal(0);
			setVisibleImageModal(true);
		},
		[setIdxSelectedImageModal, setVisibleImageModal],
	);

	const dataReverse = useMemo(() => {
		const data = cloneDeep(messages);
		return data.reverse();
	}, [messages]);

	const jumpToRepliedMessage = useCallback(
		(messageId: string) => {
			const indexToJump = dataReverse.findIndex((message) => message === messageId);
			if (indexToJump !== -1 && flatListRef.current) {
				flatListRef.current.scrollToIndex({ animated: true, index: indexToJump - 1 });
			}
		},
		[dataReverse],
	);

	const renderItem = useCallback(
		({ item }) => {
			return (
				<MessageItem
					jumpToRepliedMessage={jumpToRepliedMessage}
					clansProfile={clansProfile}
					channelMember={channelMember}
					messageId={item}
					mode={mode}
					channelId={channelId}
					channelLabel={channelLabel}
					onOpenImage={onOpenImage}
					currentClan={currentClan}
				/>
			);
		},
		[mode, channelId, channelLabel, onOpenImage, jumpToRepliedMessage],
	);

	const onImageModalChange = useCallback(
		(idx: number) => {
			setIdxSelectedImageModal(idx);
		},
		[setIdxSelectedImageModal],
	);

	const onImageFooterChange = useCallback(
		(idx: number) => {
			setVisibleImageModal(false);
			setVisibleImageModalOverlay(true);
			setIdxSelectedImageModal(idx);
			timeOutRef.current = setTimeout(() => {
				setVisibleImageModal(true);
			}, 50);
			timeOutRef.current = setTimeout(() => {
				setVisibleImageModalOverlay(false);
			}, 500);
		},
		[setIdxSelectedImageModal, setVisibleImageModal, setVisibleImageModalOverlay],
	);

	return (
		<View style={styles.wrapperChannelMessage}>
			{!isLoadMore && isLoading === 'loaded' && !messages?.length && <WelcomeMessage channelTitle={channelLabel} />}
			{isLoading === 'loading' && !isLoadMore && <MessageItemSkeleton skeletonNumber={15} />}
			<FlatList
				ref={flatListRef}
				inverted
				data={dataReverse || []}
				onScroll={handleScroll}
				keyboardShouldPersistTaps={'handled'}
				contentContainerStyle={styles.listChannels}
				renderItem={renderItem}
				keyExtractor={(item) => `${item}`}
				maxToRenderPerBatch={5}
				initialNumToRender={5}
				windowSize={10}
				onEndReached={!!messages?.length && onLoadMore}
				onEndReachedThreshold={0.5}
				ListFooterComponent={isLoadMore && hasMoreMessage ? <ViewLoadMore /> : null}
			/>
			{showScrollToBottomButton && (
				<TouchableOpacity style={styles.btnScrollDown} onPress={scrollToBottom} activeOpacity={0.8}>
					<Icons.ArrowLargeDownIcon color={themeValue.textStrong} height={20} width={20} />
				</TouchableOpacity>
			)}
			{!!typingLabel && <Text style={styles.typingLabel}>{typingLabel}</Text>}
			{visibleImageModalOverlay && (
				<View style={styles.overlay}>
					<Flow size={size.s_34 * 2} color={Colors.bgViolet} />
				</View>
			)}
			<ImageListModal
				data={formatAttachments}
				visible={visibleImageModal}
				idxSelected={idxSelectedImageModal}
				onImageChange={onImageModalChange}
				onClose={() => setVisibleImageModal(false)}
				onImageChangeFooter={onImageFooterChange}
			/>
		</View>
	);
});

export default ChannelMessages;
