import { useAuth, useClans } from '@mezon/core';
import {
	ActionEmitEvent,
	FileIcon,
	ReplyIcon,
	ReplyMessageDeleted,
	STORAGE_KEY_CLAN_CURRENT_CACHE,
	getUpdateOrAddClanChannelCache,
	save,
} from '@mezon/mobile-components';
import { Colors, Metrics, Text, size, useTheme, verticalScale } from '@mezon/mobile-ui';
import {
	ChannelMembersEntity,
	ChannelsEntity,
	ClansEntity,
	UserClanProfileEntity,
	channelsActions,
	getStoreAsync,
	messagesActions,
	selectChannelsEntities,
	selectEmojiImage,
	selectMemberByUserId,
	selectMessageByMessageId,
	selectMessageEntityById,
	selectIdMessageToJump,
	referencesActions,
	selectLastSeenMessage,
	selectUserClanProfileByClanID,
	useAppDispatch,
} from '@mezon/store-mobile';
import { IMessageWithUser, convertTimeString, notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, DeviceEventEmitter, Image, Linking, Pressable, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { useMessageParser } from '../../../../../../hooks/useMessageParser';
import { isImage, isVideo, linkGoogleMeet } from '../../../../../../utils/helpers';
import { MessageAction, MessageItemBS } from '../..';
import { renderTextContent } from '../../../constants';
import { EMessageActionType, EMessageBSToShow } from '../../../enums';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useSeenMessagePool } from 'libs/core/src/lib/chat/hooks/useSeenMessagePool';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { setSelectedMessage } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { ChannelType } from 'mezon-js';
import { useTranslation } from 'react-i18next';
import { openUrl } from 'react-native-markdown-display';
import { RenderVideoChat } from '../../RenderVideoChat';
import { Swipeable } from 'react-native-gesture-handler';
import { IMessageActionNeedToResolve, IMessageActionPayload } from '../../../types';
import { style } from './styles';

const widthMedia = Metrics.screenWidth - 150;

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
	channelMember?: ChannelMembersEntity[];
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
	const { mode, onOpenImage, isNumberOfLine, currentClan, channelMember, clansProfile, jumpToRepliedMessage, onMessageAction, setIsOnlyEmojiPicker, showUserInformation = false, preventAction = false } = props;
	const selectedMessage = useSelector((state) => selectMessageEntityById(state, props.channelId, props.messageId));
	const message = useMemo(() => {
		return props?.message ? props?.message : selectedMessage;
	}, [props?.message, selectedMessage]);
	const userLogin = useAuth();
	const dispatch = useAppDispatch();
	const { attachments, lines } = useMessageParser(message);
	const user = useSelector(selectMemberByUserId(message?.sender_id));
	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);
	const [calcImgHeight, setCalcImgHeight] = useState<number>(180);
	const [messageRefId, setMessageRefId] = useState<string>('');
	const [senderId, setSenderId] = useState<string>('');
	const messageRefFetchFromServe = useSelector(selectMessageByMessageId(messageRefId));
	const repliedSender = useSelector(selectMemberByUserId(senderId));
	const emojiListPNG = useSelector(selectEmojiImage);
	const { markMessageAsSeen } = useSeenMessagePool();
	const channelsEntities = useSelector(selectChannelsEntities);
	const lastSeen = useSelector(selectLastSeenMessage(props.channelId, props.messageId));
  const checkAnonymous = useMemo(() => message?.sender_id === idUserAnonymous,[message?.sender_id]);
	const { usersClan } = useClans();
	const { t } = useTranslation('message');
	const hasIncludeMention = useMemo(() => {
		return message?.content?.t?.includes('@here') || message?.content?.t?.includes(`@${userLogin.userProfile?.user?.username}`);
	}, [message, userLogin]);
	const isCombine = !message.isStartedMessageGroup;
	const isShowInfoUser = useMemo(() => !isCombine || (message?.references?.length && !!user), [isCombine, message, user]);
	const clanProfile = useSelector(selectUserClanProfileByClanID(currentClan?.clan_id as string, user?.user?.id as string));
	const clanProfileSender = useSelector(selectUserClanProfileByClanID(currentClan?.clan_id as string, messageRefFetchFromServe?.user?.id as string));
	const videoRef = React.useRef(null);
	const swipeableRef = React.useRef(null);
	const idMessageToJump = useSelector(selectIdMessageToJump);
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
			const messageReferenceId = message.references[0].message_ref_id;
			const messageReferenceUserId = message.references[0].message_sender_id;
			setMessageRefId(messageReferenceId ?? '');
			setSenderId(messageReferenceUserId ?? '');
		}
	}, [message]);

	useEffect(() => {
		if (message.references && message?.references?.length > 0) {
			const messageReferenceId = message.references[0].message_ref_id;
			const messageReferenceUserId = message.references[0].message_sender_id;
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

	const renderVideos = (videoItem?: any) => {
		return (
			<View
				style={{
					height: 170,
					width: widthMedia + size.s_50,
					marginTop: size.s_10,
				}}
			>
				{videoItem ? (
					<RenderVideoChat key={`${videoItem?.url}_${new Date().getTime()}`} videoURI={videoItem?.url} />
				) : (
					videos.map((video, index) => {
						return <RenderVideoChat key={video?.url} videoURI={video?.url} />;
					})
				)}
			</View>
		);
	};

	const imageItem = ({ image, index, checkImage }) => {
		return (
			<TouchableOpacity
				disabled={checkImage}
				activeOpacity={0.8}
				key={index}
				onPress={() => {
					onOpenImage({
						...image,
						uploader: message.sender_id,
						create_time: message.create_time,
					});
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
	};

	const renderImages = () => {
		return (
			<View>
				{images.map((image, index) => {
					const checkImage = notImplementForGifOrStickerSendFromPanel(image);

					return imageItem({ image, index, checkImage });
				})}
			</View>
		);
	};

	const renderDocuments = () => {
		return documents.map((document, index) => {
			const isShowImage = isImage(document?.url?.toLowerCase());
			if (isShowImage) {
				const checkImage = notImplementForGifOrStickerSendFromPanel(document);

				return imageItem({ image: document, index, checkImage: checkImage });
			}
			const checkIsVideo = isVideo(document?.url?.toLowerCase());

			if (checkIsVideo) {
				return renderVideos(document);
			}

			return (
				<TouchableOpacity activeOpacity={0.8} key={index} onPress={() => openUrl(document.url)}>
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
				const clanUser = usersClan?.find((userClan) => tagName === userClan?.user?.username );
				if (!mentionedUser) return;
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
				save(STORAGE_KEY_CLAN_CURRENT_CACHE, dataSave);
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
		<Swipeable
			renderRightActions={renderRightActions}
			ref={swipeableRef}
			overshootRight={false}
			onSwipeableOpen={handleSwipeableOpen}
		>
			<View
				style={[
					styles.messageWrapper,
					isCombine && { marginTop: 0 },
					hasIncludeMention && styles.highlightMessageMention,
					checkMessageTargetToMoved && styles.highlightMessageReply
				]}
				>
					{lastSeen &&
						<View style={styles.newMessageLine}>
							<View style={styles.newMessageContainer}>
								<Text style={styles.newMessageText}>NEW MESSAGE</Text>
							</View>
						</View>}
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
									{renderTextContent(messageRefFetchFromServe?.content?.t?.trim(), false, t, channelsEntities, emojiListPNG, null, null, true, clansProfile, currentClan, channelMember, true)}
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
										onMessageAction({
											type: EMessageBSToShow.UserInformation,
											user: user?.user
										})
									}}
									style={styles.messageBoxTop}
								>
									<Text style={styles.userNameMessageBox}>{senderDisplayName}</Text>
									<Text style={styles.dateMessageBox}>{message?.create_time ? convertTimeString(message?.create_time) : ''}</Text>
								</TouchableOpacity>
							) : null}
							{videos?.length > 0 && renderVideos()}
							{images?.length > 0 && renderImages()}

							{documents?.length > 0 && renderDocuments()}
							{renderTextContent(lines, isEdited, t, channelsEntities, emojiListPNG, onMention, onChannelMention, isNumberOfLine, clansProfile, currentClan, channelMember)}
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
						</Pressable>
					</View>
			</View>
		</Swipeable>
	);
}, arePropsEqual);

export default MessageItem;
