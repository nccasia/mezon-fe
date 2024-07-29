import { useDeleteMessage } from '@mezon/core';
import { ActionEmitEvent, Icons, load, save, STORAGE_CHANNEL_CURRENT_CACHE } from '@mezon/mobile-components';
import { Colors, Metrics, size, useAnimatedState, useTheme } from '@mezon/mobile-ui';
import { useAppSelector } from '@mezon/store';
import {
	messagesActions,
	RootState,
	selectAttachmentPhoto,
	selectHasMoreMessageByChannelId,
	selectMessageIdsByChannelId,
	useAppDispatch,
} from '@mezon/store-mobile';
import { IMessageWithUser } from '@mezon/utils';
import { cloneDeep } from 'lodash';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiUser } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, Keyboard, TouchableOpacity, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { ImageListModal } from '../../../components/ImageListModal';
import MessageItemSkeleton from '../../../components/Skeletons/MessageItemSkeleton';
import { MessageItemBS } from './components';
import { ConfirmPinMessageModal } from './components/ConfirmPinMessageModal';
import ForwardMessageModal from './components/ForwardMessage';
import { MessageUserTyping } from './components/MessageUserTyping';
import { ReportMessageModal } from './components/ReportMessageModal';
import { EMessageActionType, EMessageBSToShow } from './enums';
import MessageItem from './MessageItem';
import { style } from './styles';
import { IConfirmActionPayload, IMessageActionPayload } from './types';

const ITEM_HEIGHT = 100;
const NX_CHAT_APP_ANNONYMOUS_USER_ID = process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID || 'anonymous';

type ChannelMessagesProps = {
	channelId: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: ChannelStreamMode;
};

const ChannelMessages = React.memo(({ channelId, channelLabel, mode }: ChannelMessagesProps) => {
	const dispatch = useAppDispatch();
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const messages = useAppSelector((state) => selectMessageIdsByChannelId(state, channelId));
	const isLoading = useSelector((state: RootState) => state?.messages?.loadingStatus);
	const attachments = useSelector(selectAttachmentPhoto());
	const hasMoreMessage = useSelector(selectHasMoreMessageByChannelId(channelId));
	const { deleteSendMessage } = useDeleteMessage({ channelId, mode });

	const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
	const flatListRef = useRef(null);
	const timeOutRef = useRef(null);
	const [openBottomSheet, setOpenBottomSheet] = useState<EMessageBSToShow | null>(null);
	const [userSelected, setUserSelected] = useState<ApiUser | null>(null);
	const [messageSelected, setMessageSelected] = useState<IMessageWithUser | null>(null);
	const [isOnlyEmojiPicker, setIsOnlyEmojiPicker] = useState<boolean>(false);
	const [senderDisplayName, setSenderDisplayName] = useState('');
	const [imageSelected, setImageSelected] = useState<ApiMessageAttachment>();

	const checkAnonymous = useMemo(() => messageSelected?.sender_id === NX_CHAT_APP_ANNONYMOUS_USER_ID, [messageSelected?.sender_id]);

	const loadMoreMessage = React.useCallback(async () => {
		return await dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

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
	const [currentMessageActionType, setCurrentMessageActionType] = useState<EMessageActionType | null>(null);

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

	useEffect(() => {
		const messageItemBSListener = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_INFO_USER_BOTTOM_SHEET, ({ isHiddenBottomSheet }) => {
			isHiddenBottomSheet && setOpenBottomSheet(null);
		});

		const showSKlListener = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, ({ isShow }) => {
			setIsShowSkeleton(isShow);
		});
		return () => {
			messageItemBSListener.remove();
			showSKlListener.remove();
		};
	}, []);

	const onConfirmAction = useCallback(
		(payload: IConfirmActionPayload) => {
			const { type, message, senderDisplayName, user } = payload;
			switch (type) {
				case EMessageActionType.DeleteMessage:
					deleteSendMessage(message?.id);
					break;
				case EMessageActionType.ForwardMessage:
				case EMessageActionType.Report:
				case EMessageActionType.PinMessage:
				case EMessageActionType.UnPinMessage:
					setCurrentMessageActionType(type);
					break;
				default:
					break;
			}
		},
		[deleteSendMessage],
	);

	const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
	const [isShowSkeleton, setIsShowSkeleton] = React.useState<boolean>(true);
	const onLoadMore = useCallback(async () => {
		if (isLoadMore || isLoading === 'loading') {
			return;
		}
		setIsLoadMore(true);
		await loadMoreMessage();
		setIsLoadMore(false);
	}, [isLoadMore, loadMoreMessage, isLoading]);

	const handleScroll = useCallback(
		(event: { nativeEvent: { contentOffset: { y: any } } }) => {
			const offsetY = event.nativeEvent.contentOffset.y;
			const threshold = 300; // Adjust this value to determine when to show the button

			if (offsetY > threshold && !showScrollToBottomButton) {
				setShowScrollToBottomButton(true);
			} else if (offsetY <= threshold && showScrollToBottomButton) {
				setShowScrollToBottomButton(false);
			}
		},
		[showScrollToBottomButton],
	);

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

	const onMessageAction = useCallback((payload: IMessageActionPayload) => {
		const { message, type, user, senderDisplayName } = payload;
		switch (type) {
			case EMessageBSToShow.MessageAction:
				setMessageSelected(message);
				setSenderDisplayName(senderDisplayName);
				break;
			case EMessageBSToShow.UserInformation:
				setUserSelected(user);
				setMessageSelected(message);
				break;
			default:
				break;
		}
		Keyboard.dismiss();
		setOpenBottomSheet(type);
	}, []);

	const renderItem = useCallback(
		({ item }) => {
			return (
				<MessageItem
					key={`message_item_${item}`}
					jumpToRepliedMessage={jumpToRepliedMessage}
					messageId={item}
					mode={mode}
					channelId={channelId}
					channelName={channelLabel}
					onOpenImage={onOpenImage}
					onMessageAction={onMessageAction}
					setIsOnlyEmojiPicker={setIsOnlyEmojiPicker}
				/>
			);
		},
		[jumpToRepliedMessage, mode, channelId, channelLabel, onOpenImage, onMessageAction],
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
		<View style={{ flex: 1 }}>
			<View style={styles.wrapperChannelMessage}>
				{isLoading === 'loading' && !isLoadMore && !checkChannelCacheLoading && isShowSkeleton && <MessageItemSkeleton skeletonNumber={15} />}
				<FlatList
					ref={flatListRef}
					inverted
					data={dataReverse || []}
					// onScroll={handleScroll}
					keyboardShouldPersistTaps={'handled'}
					contentContainerStyle={styles.listChannels}
					renderItem={renderItem}
					removeClippedSubviews={true}
					keyExtractor={(item) => `${item}`}
					// estimatedItemSize={ITEM_HEIGHT}
					onEndReached={messages?.length ? onLoadMore : undefined}
					onEndReachedThreshold={0.1}
					showsVerticalScrollIndicator={false}
					ListFooterComponent={isLoadMore && hasMoreMessage ? <ViewLoadMore /> : null}
				/>

				{showScrollToBottomButton && (
					<TouchableOpacity style={styles.btnScrollDown} onPress={scrollToBottom} activeOpacity={0.8}>
						<Icons.ArrowLargeDownIcon color={themeValue.textStrong} height={20} width={20} />
					</TouchableOpacity>
				)}

				<MessageUserTyping channelId={channelId} />
			</View>

			<View>
				{visibleImageModalOverlay && (
					<View style={styles.overlay}>
						<Flow size={size.s_34 * 2} color={Colors.bgViolet} />
					</View>
				)}

				{visibleImageModal ? (
					<ImageListModal
						data={formatAttachments}
						visible={visibleImageModal}
						idxSelected={idxSelectedImageModal}
						onImageChange={onImageModalChange}
						onClose={() => setVisibleImageModal(false)}
						onImageChangeFooter={onImageFooterChange}
					/>
				) : null}

				{openBottomSheet !== null && (
					<MessageItemBS
						mode={mode}
						message={messageSelected}
						onConfirmAction={onConfirmAction}
						type={openBottomSheet}
						isOnlyEmojiPicker={isOnlyEmojiPicker}
						onClose={() => {
							setOpenBottomSheet(null);
						}}
						user={userSelected}
						checkAnonymous={checkAnonymous}
						senderDisplayName={senderDisplayName}
					/>
				)}

				{currentMessageActionType === EMessageActionType.ForwardMessage && (
					<ForwardMessageModal
						show={currentMessageActionType === EMessageActionType.ForwardMessage}
						onClose={() => setCurrentMessageActionType(null)}
						message={messageSelected}
					/>
				)}

				{currentMessageActionType === EMessageActionType.Report && (
					<ReportMessageModal
						isVisible={currentMessageActionType === EMessageActionType.Report}
						onClose={() => setCurrentMessageActionType(null)}
						message={messageSelected}
					/>
				)}

				{[EMessageActionType.PinMessage, EMessageActionType.UnPinMessage].includes(currentMessageActionType) && (
					<ConfirmPinMessageModal
						isVisible={[EMessageActionType.PinMessage, EMessageActionType.UnPinMessage].includes(currentMessageActionType)}
						onClose={() => setCurrentMessageActionType(null)}
						message={messageSelected}
						type={currentMessageActionType}
					/>
				)}
			</View>
		</View>
	);
});

export default ChannelMessages;
