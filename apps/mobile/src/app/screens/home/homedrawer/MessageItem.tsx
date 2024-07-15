import { useClans } from '@mezon/core';
import {
	ActionEmitEvent,
	AttachmentImageIcon,
	FileIcon,
	ReplyIcon,
	ReplyMessageDeleted,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	getUpdateOrAddClanChannelCache,
	save,
} from '@mezon/mobile-components';
import { Colors, Metrics, Text, size, useTheme, verticalScale, useAnimatedState, Block } from '@mezon/mobile-ui';
import {
	ChannelsEntity,
	ClansEntity,
	UserClanProfileEntity,
	channelsActions,
	getStoreAsync,
	messagesActions,
	selectChannelsEntities,
	selectAllEmojiSuggestion,
	selectMemberByUserId,
	selectMessageByMessageId,
	selectMessageEntityById,
	selectIdMessageToJump,
	referencesActions,
	selectUserClanProfileByClanID,
	useAppDispatch,
  selectAllAccount,
  selectAllUsesClan,
} from '@mezon/store-mobile';
import { IMessageWithUser, MentionDataProps, convertTimeString, notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { ApiMessageAttachment, ApiUser } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, DeviceEventEmitter, Image, Linking, Pressable, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
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
import { openUrl } from 'react-native-markdown-display';
import { RenderVideoChat } from './components/RenderVideoChat';
import { Swipeable } from 'react-native-gesture-handler';
import { IMessageActionNeedToResolve, IMessageActionPayload } from './types';

const widthMedia = Metrics.screenWidth - 140;

export type MessageItemProps = {
	message?: IMessageWithUser;
	messageId?: string;
	isMessNotifyMention?: boolean;
	mode: number;
	channelId?: string;
	onOpenImage?: (image: ApiMessageAttachment) => void;
	isNumberOfLine?: boolean;
	jumpToRepliedMessage?: (messageId: string) => void;
	currentClan?: ClansEntity;
	clansProfile?: UserClanProfileEntity[];
	onMessageAction?: (payload: IMessageActionPayload) => void;
	setIsOnlyEmojiPicker?: (value: boolean) => void;
	showUserInformation?: boolean;
	preventAction?: boolean
};

const arePropsEqual = (prevProps, nextProps) => {
	return prevProps.message === nextProps.message;
};

const idUserAnonymous = "1767478432163172999";

const MessageItem = React.memo((props: MessageItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { mode, onOpenImage, isNumberOfLine, currentClan, clansProfile, jumpToRepliedMessage, onMessageAction, setIsOnlyEmojiPicker, showUserInformation = false, preventAction = false } = props;
	const selectedMessage = useSelector((state) => selectMessageEntityById(state, props.channelId, props.messageId));
	const message = useMemo(() => {
		return props?.message ? props?.message : selectedMessage;
	}, [props?.message, selectedMessage]);
	const dispatch = useAppDispatch();
	const { attachments, lines } = useMessageParser(message);
	const user = useSelector(selectMemberByUserId(message?.sender_id));
	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);
	const [calcImgHeight, setCalcImgHeight] = useAnimatedState<number>(180);
	const [messageRefId, setMessageRefId] = useState<string>('');
	const [senderId, setSenderId] = useState<string>('');
	const messageRefFetchFromServe = useSelector(selectMessageByMessageId(messageRefId));
	const repliedSender = useSelector(selectMemberByUserId(senderId));
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const { markMessageAsSeen } = useSeenMessagePool();
	const channelsEntities = useSelector(selectChannelsEntities);
	const checkAnonymous = useMemo(() => message?.sender_id === idUserAnonymous, [message?.sender_id]);
	const { t } = useTranslation('message');
	const userProfile = useSelector(selectAllAccount);
	const hasIncludeMention = useMemo(() => {
		return message?.content?.t?.includes('@here') || message?.content?.t?.includes(`@${userProfile?.user?.username}`);
	}, [message, userProfile]);
	const isCombine = !message?.isStartedMessageGroup;
	const isShowInfoUser = !isCombine || (message?.references?.length && !!user);
	const clanProfile = useSelector(selectUserClanProfileByClanID(currentClan?.clan_id as string, user?.user?.id as string));
	const clanProfileSender = useSelector(selectUserClanProfileByClanID(currentClan?.clan_id as string, messageRefFetchFromServe?.user?.id as string));
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

	const imageItem = useCallback(({ image, index, checkImage }) => {
		return (
			<TouchableOpacity
				disabled={checkImage}
				activeOpacity={0.8}
				key={index}
				onPress={() => {
					onOpenImage?.({
						...image,
						uploader: message.sender_id,
						create_time: message.create_time,
					});
				}}
				onLongPress={() => {
					if (preventAction) return;
					setIsOnlyEmojiPicker(false);
					onMessageAction({
						type: EMessageBSToShow.MessageAction,
						senderDisplayName,
						message
					})
					dispatch(setSelectedMessage(message));
				}}
			>
				<FastImage
					style={[
						styles.imageMessageRender,
						{
							width: widthMedia,
							height: calcImgHeight,
						},
					]}
					source={{ uri: image?.url }}
					resizeMode="contain"
					onLoad={(evt) => {
						setCalcImgHeight((evt.nativeEvent.height / evt.nativeEvent.width) * widthMedia);
					}}
				/>
			</TouchableOpacity>
		);
	}, [images, calcImgHeight]);

	const renderImages = useCallback(() => {
		return (
			<View>
				{images.map((image, index) => {
					const checkImage = notImplementForGifOrStickerSendFromPanel(image);

					return imageItem({ image, index, checkImage });
				})}
			</View>
		);
	}, [images, calcImgHeight]);

	const renderDocuments = () => {
		return documents.map((document, index) => {
			const isShowImage = isImage(document?.url?.toLowerCase());
			if (isShowImage) {
				const checkImage = notImplementForGifOrStickerSendFromPanel(document);

				return imageItem({ image: document, index, checkImage: checkImage });
			}
			const checkIsVideo = isVideo(document?.url?.toLowerCase());

			if (checkIsVideo) {
				return <RenderVideoChat videoURL={document.url} />;
			}

			return (
				<TouchableOpacity
					activeOpacity={0.8}
					key={index}
					onPress={() => openUrl(document.url)}
					onLongPress={() => {
						if (preventAction) return;
						setIsOnlyEmojiPicker(false);
						onMessageAction({
							type: EMessageBSToShow.MessageAction,
							senderDisplayName,
							message
						})
						dispatch(setSelectedMessage(message));
					}}
				>
					<View style={styles.fileViewer}>
						<FileIcon width={verticalScale(30)} height={verticalScale(30)} color={Colors.bgViolet} />
						<View style={{ maxWidth: '75%' }}>
							<Text style={styles.fileName} numberOfLines={2}>
								{document.filename}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			);
		});
	};

	const onMention = useCallback(
		async (mentionedUser: string) => {
			try {
				const tagName = mentionedUser?.slice(1);
				const clanUser = usersClan?.find((userClan) => tagName === userClan?.user?.username);

				if (!mentionedUser || tagName === "here") return;
				onMessageAction({
					type: EMessageBSToShow.UserInformation,
					user: clanUser?.user
				})
			} catch (error) {
				console.log('error', error);
			}
		},
		[usersClan, onMessageAction],
	);

	const jumpToChannel = async (channelId: string, clanId: string) => {
		alert('jumpToChannel Message item')
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
	}

	const isEdited = useMemo(() => {
		if (message?.update_time) {
			const updateDate = new Date(message?.update_time);
			const createDate = new Date(message?.create_time);
			return updateDate > createDate;
		}
		return false;
	}, [message]);

	const senderDisplayName = useMemo(() => {
		return clanProfile?.nick_name || user?.user?.display_name || user?.user?.username || (checkAnonymous ? 'Anonymous' : message?.username)
	}, [checkAnonymous, clanProfile?.nick_name, message?.username, user?.user?.display_name, user?.user?.username])

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

	const handleSwipeableOpen = (direction: "left" | "right") => {
		if (preventAction && swipeableRef.current) {
			swipeableRef.current.close();
		}
		if (direction === 'right') {
			swipeableRef.current?.close();
			const payload: IMessageActionNeedToResolve = {
				type: EMessageActionType.Reply,
				targetMessage: message,
				isStillShowKeyboard: true,
				replyTo: senderDisplayName
			};
			//Note: trigger to ChatBox.tsx
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
		}
	};

	return (
		// <Swipeable
		// 	renderRightActions={renderRightActions}
		// 	ref={swipeableRef}
		// 	overshootRight={false}
		// 	onSwipeableOpen={handleSwipeableOpen}
		// 	hitSlop={{ left: -10 }}
		// >
			<View
				style={[
					styles.messageWrapper,
					(isCombine || preventAction) && { marginTop: 0 },
					hasIncludeMention && styles.highlightMessageMention,
					checkMessageTargetToMoved && styles.highlightMessageReply
				]}
			>
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
						<Pressable onPress={() => !preventAction && handleJumpToMessage(messageRefFetchFromServe?.id)} style={styles.repliedMessageWrapper}>
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
                      currentClan,
                      isMessageReply: true,
                      mode
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
					{isShowInfoUser || showUserInformation ? (
						<Pressable
							onPress={() => {
								if (preventAction) return;
								setIsOnlyEmojiPicker(false);
								onMessageAction({
									type: EMessageBSToShow.UserInformation,
									user: user?.user
								})
							}}
							style={styles.wrapperAvatar}
						>
							{user?.user?.avatar_url ? (
								<Image source={{ uri: user?.user?.avatar_url }} style={styles.logoUser} />
							) : (
								<View style={styles.avatarMessageBoxDefault}>
									<Text style={styles.textAvatarMessageBoxDefault}>{user?.user?.username?.charAt(0)?.toUpperCase() || 'A'}</Text>
								</View>
							)}
						</Pressable>
					) : (
						<View style={styles.wrapperAvatarCombine} />
					)}

					<Pressable
						style={[styles.rowMessageBox]}
						onLongPress={() => {
							if (preventAction) return;
							setIsOnlyEmojiPicker(false);
							onMessageAction({
								type: EMessageBSToShow.MessageAction,
								senderDisplayName,
								message
							})
							dispatch(setSelectedMessage(message));
						}}
					>
						{isShowInfoUser || showUserInformation ? (
							<TouchableOpacity
								activeOpacity={0.8}
								onPress={() => {
									if (preventAction) return;
									setIsOnlyEmojiPicker(false);

									const userForDisplay: ApiUser = user
										? user?.user
										: checkAnonymous
											? {
												username: message?.username,
												display_name: message?.name,
												id: ""
											}
											: {
												username: message?.user?.username,
												display_name: message?.user?.name,
												id: message?.user?.id
											}

									onMessageAction({
										type: EMessageBSToShow.UserInformation,
										user: userForDisplay
									})
								}}
								style={styles.messageBoxTop}
							>
								<Text style={styles.userNameMessageBox}>{senderDisplayName}</Text>
								<Text style={styles.dateMessageBox}>{message?.create_time ? convertTimeString(message?.create_time) : ''}</Text>
							</TouchableOpacity>
						) : null}
						{videos?.length > 0 && videos.map((video, index) => <RenderVideoChat key={`${video?.url}_${index}`} videoURL={video?.url} />)}
						{images?.length > 0 && renderImages()}

						{documents?.length > 0 && renderDocuments()}
						<Block opacity={(message?.isSending || message.isError) ? 0.6 : 1}>
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
                currentClan,
                isMessageReply: false,
                mode
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
										message
									})
								}}
							/>
						) : null}
					</Pressable>
				</View>
			</View>
		// </Swipeable>
	);
}, arePropsEqual);

export default MessageItem;
