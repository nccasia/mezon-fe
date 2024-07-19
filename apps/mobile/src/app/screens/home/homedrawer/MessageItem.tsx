import {
	ActionEmitEvent,
	AttachmentImageIcon,
	ReplyIcon,
	ReplyMessageDeleted,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	getUpdateOrAddClanChannelCache,
	save,
} from '@mezon/mobile-components';
import { Block, Colors, Text, useTheme } from '@mezon/mobile-ui';
import {
	ChannelsEntity,
	UserClanProfileEntity,
	channelsActions,
	getStoreAsync,
	messagesActions,
	referencesActions,
	selectAllAccount,
	selectAllEmojiSuggestion,
	selectAllUsesClan,
	selectChannelsEntities,
	selectIdMessageToJump,
	selectMemberByUserId,
	selectMessageByMessageId,
	selectMessageEntityById,
	selectUserClanProfileByClanID,
	useAppDispatch,
} from '@mezon/store-mobile';
import { IMessageWithUser, notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, DeviceEventEmitter, Image, Linking, Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { isImage, isVideo, linkGoogleMeet } from '../../../utils/helpers';
import { MessageAction } from './components';
import { renderTextContent } from './constants';
import { EMessageActionType, EMessageBSToShow } from './enums';
import { style } from './styles';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useSeenMessagePool } from 'libs/core/src/lib/chat/hooks/useSeenMessagePool';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { setSelectedMessage } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { ChannelType } from 'mezon-js';
import { useTranslation } from 'react-i18next';
import { Swipeable } from 'react-native-gesture-handler';
import { AvatarMessage } from './components/AvatarMessage';
import { InfoUserMessage } from './components/InfoUserMessage';
import { RenderDocumentsChat } from './components/RenderDocumentsChat';
import { RenderImageChat } from './components/RenderImageChat';
import { RenderVideoChat } from './components/RenderVideoChat';
import { IMessageActionNeedToResolve, IMessageActionPayload } from './types';

const NX_CHAT_APP_ANNONYMOUS_USER_ID = process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID || 'anonymous';

export type MessageItemProps = {
	message?: IMessageWithUser;
	messageId?: string;
	isMessNotifyMention?: boolean;
	mode: number;
	channelId?: string;
	onOpenImage?: (image: ApiMessageAttachment) => void;
	isNumberOfLine?: boolean;
	jumpToRepliedMessage?: (messageId: string) => void;
	currentClanId?: string;
	clansProfile?: UserClanProfileEntity[];
	onMessageAction?: (payload: IMessageActionPayload) => void;
	setIsOnlyEmojiPicker?: (value: boolean) => void;
	showUserInformation?: boolean;
	preventAction?: boolean;
};

const arePropsEqual = (prevProps, nextProps) => {
	return prevProps.message === nextProps.message;
};

const MessageItem = React.memo((props: MessageItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const {
		mode,
		onOpenImage,
		isNumberOfLine,
		currentClanId,
		clansProfile,
		jumpToRepliedMessage,
		onMessageAction,
		setIsOnlyEmojiPicker,
		showUserInformation = false,
		preventAction = false,
	} = props;
	const selectedMessage = useSelector((state) => selectMessageEntityById(state, props.channelId, props.messageId));
	const message = props?.message ? props?.message : selectedMessage;
	const dispatch = useAppDispatch();
	const { attachments, lines } = useMessageParser(message);
	const user = useSelector(selectMemberByUserId(message?.sender_id));
	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);
	const [messageRefId, setMessageRefId] = useState<string>('');
	const [senderId, setSenderId] = useState<string>('');
	const messageRefFetchFromServe = useSelector(selectMessageByMessageId(messageRefId));
	const repliedSender = useSelector(selectMemberByUserId(senderId));
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const { markMessageAsSeen } = useSeenMessagePool();
	const channelsEntities = useSelector(selectChannelsEntities);
	const checkAnonymous = useMemo(() => message?.sender_id === NX_CHAT_APP_ANNONYMOUS_USER_ID, [message?.sender_id]);
	const { t } = useTranslation('message');
	const userProfile = useSelector(selectAllAccount);
	const hasIncludeMention = useMemo(() => {
		return message?.content?.t?.includes('@here') || message?.content?.t?.includes(`@${userProfile?.user?.username}`);
	}, [message, userProfile]);
	const isCombine = !message?.isStartedMessageGroup;
	const clanProfile = useSelector(selectUserClanProfileByClanID(currentClanId as string, user?.user?.id as string));
	const clanProfileSender = useSelector(selectUserClanProfileByClanID(currentClanId as string, messageRefFetchFromServe?.user?.id as string));
	const swipeableRef = React.useRef(null);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const usersClan = useSelector(selectAllUsesClan);
	const checkMessageTargetToMoved = useMemo(() => {
		return idMessageToJump === message?.id;
	}, [idMessageToJump, message?.id]);

	const classifyAttachments = (attachments: ApiMessageAttachment[]) => {
		const videos: ApiMessageAttachment[] = [];
		const images: ApiMessageAttachment[] = [];
		const documents: ApiMessageAttachment[] = [];

		attachments.forEach((attachment) => {
			if (attachment.filetype?.indexOf('video/mp4') !== -1 && !attachment.url?.includes('tenor.com')) {
				videos.push(attachment);
			} else if (attachment.filetype?.indexOf('image/png') !== -1 || attachment.filetype?.indexOf('image/jpeg') !== -1) {
				images.push(attachment);
			} else {
				documents.push(attachment);
			}
		});

		return { videos, images, documents };
	};

	const isMessageReplyDeleted = useMemo(() => {
		return !messageRefFetchFromServe && message?.references && message?.references?.length;
	}, [messageRefFetchFromServe, message.references]);

	useEffect(() => {
		if (props?.messageId) {
			const timestamp = Date.now() / 1000;
			markMessageAsSeen(message);
			dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId: message.channel_id, timestamp }));
		}
	}, [dispatch, markMessageAsSeen, message, props.messageId]);

	useEffect(() => {
		if (message.references && message?.references?.length > 0) {
			const messageReferenceId = message?.references?.[0]?.message_ref_id;
			const messageReferenceUserId = message?.references?.[0]?.message_sender_id;
			setMessageRefId(messageReferenceId ?? '');
			setSenderId(messageReferenceUserId ?? '');
		}
	}, [message]);

	useEffect(() => {
		const { videos, images, documents } = classifyAttachments(attachments ?? []);
		setVideos(videos);
		setImages(images);
		setDocuments(documents);
	}, [attachments]);

	const onPressImage = useCallback(
		(image: any) => {
			onOpenImage?.({
				...image,
				uploader: message.sender_id,
				create_time: message.create_time,
			});
		},
		[message.create_time, message.sender_id],
	);

	const onLongPressImage = useCallback(() => {
		if (preventAction) return;
		setIsOnlyEmojiPicker(false);
		onMessageAction({
			type: EMessageBSToShow.MessageAction,
			senderDisplayName,
			message,
		});
		dispatch(setSelectedMessage(message));
	}, [message, preventAction]);

	const onPressAvatar = useCallback(() => {
		if (preventAction) return;
		setIsOnlyEmojiPicker(false);
		onMessageAction({
			type: EMessageBSToShow.UserInformation,
			user: user?.user,
			message,
		});
	}, [preventAction, user?.user]);

	const onPressInfoUser = useCallback(() => {
		if (preventAction) return;
		setIsOnlyEmojiPicker(false);

		onMessageAction({
			type: EMessageBSToShow.UserInformation,
			user: user?.user,
			message,
		});
	}, [checkAnonymous, message?.name, message?.user?.id, message?.user?.name, message?.user?.username, message?.username, preventAction, user]);

	const renderDocuments = () => {
		return documents.map((document, index) => {
			const isShowImage = isImage(document?.url?.toLowerCase());
			if (isShowImage) {
				const checkImage = notImplementForGifOrStickerSendFromPanel(document);

				return (
					<RenderImageChat
						disable={checkImage}
						image={document}
						key={`${document?.url}_${index}`}
						onPress={onPressImage}
						onLongPress={onLongPressImage}
					/>
				);
			}
			const checkIsVideo = isVideo(document?.url?.toLowerCase());

			if (checkIsVideo) {
				return <RenderVideoChat key={`${document?.url}_${index}`} videoURL={document.url} />;
			}

			return (
				<RenderDocumentsChat
					key={`${document?.url}_${index}`}
					document={document}
					onLongPress={onLongPressImage}
					onPressImage={onPressImage}
				/>
			);
		});
	};

	const onMention = useCallback(
		async (mentionedUser: string) => {
			try {
				const tagName = mentionedUser?.slice(1);
				const clanUser = usersClan?.find((userClan) => tagName === userClan?.user?.username);

				if (!mentionedUser || tagName === 'here') return;
				onMessageAction({
					type: EMessageBSToShow.UserInformation,
					user: clanUser?.user,
				});
			} catch (error) {
				console.log('error', error);
			}
		},
		[usersClan, onMessageAction],
	);

	const jumpToChannel = async (channelId: string, clanId: string) => {
		const store = await getStoreAsync();

		store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId }));
		store.dispatch(
			channelsActions.joinChannel({
				clanId,
				channelId,
				noFetchMembers: false,
			}),
		);
	};

	const onChannelMention = useCallback(async (channel: ChannelsEntity) => {
		try {
			const type = channel?.type;
			const channelId = channel?.channel_id;
			const clanId = channel?.clan_id;

			if (type === ChannelType.CHANNEL_TYPE_VOICE && channel?.status === 1 && channel?.meeting_code) {
				const urlVoice = `${linkGoogleMeet}${channel?.meeting_code}`;
				await Linking.openURL(urlVoice);
			} else if (type === ChannelType.CHANNEL_TYPE_TEXT) {
				const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
				save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
				await jumpToChannel(channelId, clanId);
			}
		} catch (error) {
			console.log(error);
		}
	}, []);

	const handleJumpToMessage = (messageId: string) => {
		dispatch(referencesActions.setIdMessageToJump(messageId));
		jumpToRepliedMessage(messageRefFetchFromServe?.id);
	};

	const isEdited = useMemo(() => {
		if (message?.update_time) {
			const updateDate = new Date(message?.update_time);
			const createDate = new Date(message?.create_time);
			return updateDate > createDate;
		}
		return false;
	}, [message]);

	const senderDisplayName = useMemo(() => {
		return clanProfile?.nick_name || user?.user?.display_name || user?.user?.username || (checkAnonymous ? 'Anonymous' : message?.username);
	}, [checkAnonymous, clanProfile?.nick_name, message?.username, user?.user?.display_name, user?.user?.username]);

	const renderRightActions = (progress, dragX) => {
		const scale = dragX.interpolate({
			inputRange: [-50, 0],
			outputRange: [1, 0],
			extrapolate: 'clamp',
		});
		return (
			<Animated.View style={[{ transform: [{ scale }] }, { alignItems: 'center', justifyContent: 'center' }]}>
				<ReplyMessageDeleted width={70} height={25} color={Colors.bgViolet} />
			</Animated.View>
		);
	};

	const handleSwipeableOpen = (direction: 'left' | 'right') => {
		if (preventAction && swipeableRef.current) {
			swipeableRef.current.close();
		}
		if (direction === 'right') {
			swipeableRef.current?.close();
			const payload: IMessageActionNeedToResolve = {
				type: EMessageActionType.Reply,
				targetMessage: message,
				isStillShowKeyboard: true,
				replyTo: senderDisplayName,
			};
			//Note: trigger to ChatBox.tsx
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
		}
	};

	return (
		<Swipeable
			renderRightActions={renderRightActions}
			ref={swipeableRef}
			overshootRight={false}
			onSwipeableOpen={handleSwipeableOpen}
			hitSlop={{ left: -10 }}
		>
			<View
				style={[
					styles.messageWrapper,
					(isCombine || preventAction) && { marginTop: 0 },
					hasIncludeMention && styles.highlightMessageMention,
					checkMessageTargetToMoved && styles.highlightMessageReply,
				]}
			>
				{/* NEW LINE MESSAGE - TO BE UPDATE CORRECT LOGIC*/}
				{/*{lastSeen &&*/}
				{/*	<View style={styles.newMessageLine}>*/}
				{/*		<View style={styles.newMessageContainer}>*/}
				{/*			<Text style={styles.newMessageText}>NEW MESSAGE</Text>*/}
				{/*		</View>*/}
				{/*	</View>}*/}
				{messageRefFetchFromServe ? (
					<View style={styles.aboveMessage}>
						<View style={styles.iconReply}>
							<ReplyIcon width={34} height={30} />
						</View>
						<Pressable
							onPress={() => !preventAction && handleJumpToMessage(messageRefFetchFromServe?.id)}
							style={styles.repliedMessageWrapper}
						>
							{repliedSender?.user?.avatar_url ? (
								<View style={styles.replyAvatar}>
									<Image source={{ uri: repliedSender?.user?.avatar_url }} style={styles.replyAvatar} />
								</View>
							) : (
								<View style={[styles.replyAvatar]}>
									<View style={styles.avatarMessageBoxDefault}>
										<Text style={styles.repliedTextAvatar}>{repliedSender?.user?.username?.charAt(0)?.toUpperCase() || 'A'}</Text>
									</View>
								</View>
							)}
							<View style={styles.replyContentWrapper}>
								<Text style={styles.replyDisplayName}>
									{clanProfileSender?.nick_name || repliedSender?.user?.display_name || repliedSender?.user?.username || 'Anonymous'}
								</Text>
								{messageRefFetchFromServe?.attachments?.length ? (
									<>
										<Text style={styles.tapToSeeAttachmentText}>{t('tapToSeeAttachment')}</Text>
										<AttachmentImageIcon width={13} height={13} color={Colors.textGray} />
									</>
								) : (
									<>
										{renderTextContent({
											lines: messageRefFetchFromServe?.content?.t?.trim(),
											isEdited: false,
											translate: t,
											channelsEntities,
											emojiListPNG,
											isNumberOfLine: true,
											clansProfile,
											currentClanId,
											isMessageReply: true,
											mode,
										})}
									</>
								)}
							</View>
						</Pressable>
					</View>
				) : null}
				{isMessageReplyDeleted ? (
					<View style={styles.aboveMessageDeleteReply}>
						<View style={styles.iconReply}>
							<ReplyIcon width={34} height={30} style={styles.deletedMessageReplyIcon} />
						</View>
						<View style={styles.iconMessageDeleteReply}>
							<ReplyMessageDeleted width={18} height={9} />
						</View>
						<Text style={styles.messageDeleteReplyText}>{t('messageDeleteReply')}</Text>
					</View>
				) : null}
				<View style={[styles.wrapperMessageBox, !isCombine && styles.wrapperMessageBoxCombine]}>
					<AvatarMessage onPress={onPressAvatar} channelId={props.channelId} message={message} showUserInformation={showUserInformation} />
					<Pressable
						style={[styles.rowMessageBox]}
						onLongPress={() => {
							if (preventAction) return;
							setIsOnlyEmojiPicker(false);
							onMessageAction({
								type: EMessageBSToShow.MessageAction,
								senderDisplayName,
								message,
							});
							dispatch(setSelectedMessage(message));
						}}
					>
						<InfoUserMessage
							onPress={onPressInfoUser}
							senderDisplayName={senderDisplayName}
							showUserInformation={showUserInformation}
							message={message}
						/>
						{videos?.length > 0 && videos.map((video, index) => <RenderVideoChat key={`${video?.url}_${index}`} videoURL={video?.url} />)}
						{images?.length > 0 &&
							images.map((image, index) => {
								const checkImage = notImplementForGifOrStickerSendFromPanel(image);
								return (
									<RenderImageChat
										disable={checkImage}
										image={image}
										key={`${image?.url}_${index}`}
										onPress={onPressImage}
										onLongPress={onLongPressImage}
									/>
								);
							})}
						{documents?.length > 0 && renderDocuments()}
						<Block opacity={message?.isSending || message.isError ? 0.6 : 1}>
							{renderTextContent({
								lines,
								isEdited,
								translate: t,
								channelsEntities,
								emojiListPNG,
								onMention,
								onChannelMention,
								isNumberOfLine,
								clansProfile,
								currentClanId,
								isMessageReply: false,
								mode,
							})}
						</Block>
						{message.isError && <Text style={{ color: 'red' }}>{t('unableSendMessage')}</Text>}
						{!preventAction ? (
							<MessageAction
								message={message}
								mode={mode}
								emojiListPNG={emojiListPNG}
								preventAction={preventAction}
								openEmojiPicker={() => {
									setIsOnlyEmojiPicker(true);
									onMessageAction({
										type: EMessageBSToShow.MessageAction,
										senderDisplayName,
										message,
									});
								}}
							/>
						) : null}
					</Pressable>
				</View>
			</View>
		</Swipeable>
	);
}, arePropsEqual);

export default MessageItem;
