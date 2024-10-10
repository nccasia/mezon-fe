import {
	ActionEmitEvent,
	changeClan,
	getUpdateOrAddClanChannelCache,
	ReplyIcon,
	ReplyMessageDeleted,
	save,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	STORAGE_PREVIOUS_CHANNEL,
	validLinkInviteRegex
} from '@mezon/mobile-components';
import { Block, Colors, Text, useTheme } from '@mezon/mobile-ui';
import {
	channelsActions,
	ChannelsEntity,
	getStoreAsync,
	messagesActions,
	MessagesEntity,
	selectAllAccount,
	selectAllRolesClan,
	selectAllUserClans,
	selectHasInternetMobile,
	selectIdMessageToJump,
	useAppDispatch
} from '@mezon/store-mobile';
import { ApiMessageAttachment, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, DeviceEventEmitter, Linking, Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import { linkGoogleMeet } from '../../../utils/helpers';
import { MessageAction, RenderTextMarkdownContent } from './components';
import { EMessageActionType, EMessageBSToShow } from './enums';
import { style } from './styles';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useSeenMessagePool } from 'libs/core/src/lib/chat/hooks/useSeenMessagePool';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { selectCurrentChannel, selectCurrentClanId, setSelectedMessage } from '@mezon/store';
import { ETypeLinkMedia, isValidEmojiData } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { AvatarMessage } from './components/AvatarMessage';
import { InfoUserMessage } from './components/InfoUserMessage';
import { MessageAttachment } from './components/MessageAttachment';
import { MessageReferences } from './components/MessageReferences';
import { NewMessageRedLine } from './components/NewMessageRedLine';
import RenderMessageInvite from './components/RenderMessageInvite';
import { IMessageActionNeedToResolve, IMessageActionPayload } from './types';
import WelcomeMessage from './WelcomeMessage';

const NX_CHAT_APP_ANNONYMOUS_USER_ID = process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID || 'anonymous';

export type MessageItemProps = {
	message?: MessagesEntity;
	previousMessage?: MessagesEntity;
	messageId?: string;
	isMessNotifyMention?: boolean;
	mode: number;
	channelId?: string;
	onOpenImage?: (image: ApiMessageAttachment) => void;
	isNumberOfLine?: boolean;
	jumpToRepliedMessage?: (messageId: string) => void;
	currentClanId?: string;
	onMessageAction?: (payload: IMessageActionPayload) => void;
	setIsOnlyEmojiPicker?: (value: boolean) => void;
	showUserInformation?: boolean;
	preventAction?: boolean;
};

const MessageItem = React.memo(
	(props: MessageItemProps) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const {
			mode,
			onOpenImage,
			isNumberOfLine,
			jumpToRepliedMessage,
			onMessageAction,
			setIsOnlyEmojiPicker,
			showUserInformation = false,
			preventAction = false,
			channelId = ''
		} = props;
		const currentClanId = useSelector(selectCurrentClanId);
		const currentChannel = useSelector(selectCurrentChannel);
		const dispatch = useAppDispatch();
		const { t } = useTranslation('message');
		const message: MessagesEntity = props?.message;
		const previousMessage: MessagesEntity = props?.previousMessage;
		const navigation = useNavigation<any>();
		const [showHighlightReply, setShowHighlightReply] = useState(false);
		const { t: contentMessage, lk = [] } = message?.content || {};

		const isInviteLink = useMemo(() => {
			return Array.isArray(lk) && validLinkInviteRegex.test(contentMessage);
		}, [contentMessage, lk]);

		const { markMessageAsSeen } = useSeenMessagePool();
		const userProfile = useSelector(selectAllAccount);
		const idMessageToJump = useSelector(selectIdMessageToJump);
		const usersClan = useSelector(selectAllUserClans);
		const rolesInClan = useSelector(selectAllRolesClan);
		const timeoutRef = useRef<NodeJS.Timeout>(null);
		const hasInternet = useSelector(selectHasInternetMobile);

		const checkAnonymous = useMemo(() => message?.sender_id === NX_CHAT_APP_ANNONYMOUS_USER_ID, [message?.sender_id]);
		const checkSystem = useMemo(() => {
			return message?.sender_id === '0' && message?.username?.toLowerCase() === 'system';
		}, [message?.sender_id, message?.username]);

		const hasIncludeMention = useMemo(() => {
			return message?.content?.t?.includes?.('@here') || message?.content?.t?.includes?.(`@${userProfile?.user?.username}`);
		}, [message?.content?.t, userProfile]);
		const messageReferences = useMemo(() => {
			return message?.references?.[0] as ApiMessageRef;
		}, [message?.references]);

		const isSameUser = useMemo(() => {
			return message?.user?.id === previousMessage?.user?.id;
		}, [message?.user?.id, previousMessage?.user?.id]);

		const isTimeGreaterThan5Minutes = useMemo(() => {
			if (message?.create_time && previousMessage?.create_time) {
				return Date.parse(message.create_time) - Date.parse(previousMessage.create_time) < 2 * 60 * 1000;
			}
			return false;
		}, [message?.create_time, previousMessage?.create_time]);

		const isCombine = isSameUser && isTimeGreaterThan5Minutes;
		const swipeableRef = React.useRef(null);
		const backgroundColor = React.useRef(new Animated.Value(0)).current;

		const isMessageReplyDeleted = useMemo(() => {
			return !messageReferences && message?.references && message?.references?.length;
		}, [messageReferences, message.references]);

		const isDM = useMemo(() => {
			return [ChannelStreamMode.STREAM_MODE_DM, ChannelStreamMode.STREAM_MODE_GROUP].includes(mode);
		}, [mode]);

		const messageAvatar = useMemo(() => {
			if (mode === ChannelStreamMode.STREAM_MODE_CHANNEL) {
				return message?.clan_avatar || message?.avatar;
			}
			return message?.avatar;
		}, [message?.clan_avatar, message?.avatar, mode]);

		const checkOneLinkImage = useMemo(() => {
			return (
				message?.attachments?.length === 1 &&
				message?.attachments[0].filetype?.startsWith(ETypeLinkMedia.IMAGE_PREFIX) &&
				message?.attachments[0].url === message?.content?.t?.trim()
			);
		}, [message?.attachments, message?.content?.t]);

		const isOnlyContainEmoji = useMemo(() => {
			return isValidEmojiData(message.content);
		}, [message.content]);

		const isEdited = useMemo(() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			if (message?.update_time && !message.isError && !message.isErrorRetry) {
				const updateDate = new Date(message?.update_time);
				const createDate = new Date(message?.create_time);
				return updateDate > createDate;
			} else if (message.hide_editted === false && !!message?.content?.t) {
				return true;
			}
			return false;
		}, [message?.update_time, message.hide_editted, message?.content?.t, message?.create_time]);

		useEffect(() => {
			if (props?.messageId) {
				markMessageAsSeen(message);
			}
		}, [markMessageAsSeen, message, props.messageId]);

		useEffect(() => {
			if (idMessageToJump === message?.id) {
				setShowHighlightReply(true);
				timeoutRef.current = setTimeout(() => {
					setShowHighlightReply(false);
					dispatch(messagesActions.setIdMessageToJump(null));
				}, 3000);
			} else {
				setShowHighlightReply(false);
				timeoutRef.current && clearTimeout(timeoutRef.current);
			}
			return () => {
				timeoutRef.current && clearTimeout(timeoutRef.current);
			};
		}, [idMessageToJump]);

		const onLongPressImage = useCallback(() => {
			if (preventAction) return;
			setIsOnlyEmojiPicker(false);
			onMessageAction({
				type: EMessageBSToShow.MessageAction,
				senderDisplayName,
				message
			});
			dispatch(setSelectedMessage(message));
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [message, preventAction]);

		const onPressInfoUser = useCallback(() => {
			if (preventAction) return;
			setIsOnlyEmojiPicker(false);

			if (!checkAnonymous && !checkSystem) {
				onMessageAction({
					type: EMessageBSToShow.UserInformation,
					user: message?.user,
					message
				});
			}
		}, [message, onMessageAction, preventAction, setIsOnlyEmojiPicker]);

		const onMention = useCallback(
			async (mentionedUser: string) => {
				try {
					const tagName = mentionedUser?.slice(1);
					const clanUser = usersClan?.find((userClan) => tagName === userClan?.user?.username);
					const isRoleMention = rolesInClan?.some((role) => tagName === role?.id);
					if (!mentionedUser || tagName === 'here' || isRoleMention) return;
					onMessageAction({
						type: EMessageBSToShow.UserInformation,
						user: clanUser?.user
					});
				} catch (error) {
					console.log('error', error);
				}
			},
			[usersClan, rolesInClan, onMessageAction]
		);

		const jumpToChannel = async (channelId: string, clanId: string, channelCateId: string) => {
			const store = await getStoreAsync();
			// TODO: do we need to jump to message here?
			store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId, clanId }));
			store.dispatch(
				channelsActions.joinChannel({
					clanId,
					channelId,
					noFetchMembers: false
				})
			);
		};

		const onChannelMention = useCallback(async (channel: ChannelsEntity) => {
			try {
				const type = channel?.type;
				const channelId = channel?.channel_id;
				const channelCateId = channel?.category_id;
				const clanId = channel?.clan_id;

				if (type === ChannelType.CHANNEL_TYPE_VOICE && channel?.meeting_code) {
					const urlVoice = `${linkGoogleMeet}${channel?.meeting_code}`;
					await Linking.openURL(urlVoice);
				} else if ([ChannelType.CHANNEL_TYPE_TEXT, ChannelType.CHANNEL_TYPE_STREAMING].includes(type)) {
					if (type === ChannelType.CHANNEL_TYPE_STREAMING) {
						navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
							screen: APP_SCREEN.MENU_CHANNEL.STREAMING_ROOM
						});
						save(STORAGE_PREVIOUS_CHANNEL, currentChannel);
					} else {
						navigation.navigate(APP_SCREEN.HOME_DEFAULT);
					}
					if (currentClanId !== clanId) {
						changeClan(clanId);
					}
					DeviceEventEmitter.emit(ActionEmitEvent.FETCH_MEMBER_CHANNEL_DM, {
						isFetchMemberChannelDM: true
					});
					const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
					save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
					await jumpToChannel(channelId, clanId, channelCateId);
				}
			} catch (error) {
				console.log(error);
			}
		}, []);

		const senderDisplayName = useMemo(() => {
			if (isDM) {
				return message?.display_name || message?.username || '';
			}
			return message?.clan_nick || message?.display_name || message?.user?.username || (checkAnonymous ? 'Anonymous' : message?.username);
		}, [checkAnonymous, message?.clan_nick, message?.user?.username, message?.username, message?.display_name, isDM]);

		const usernameMessage = useMemo(() => {
			return isDM ? message?.display_name || message?.user?.username : message?.user?.username;
		}, [isDM, message?.display_name, message?.user?.username]);

		const renderRightActions = (progress, dragX) => {
			const scale = dragX.interpolate({
				inputRange: [-50, 0],
				outputRange: [1, 0],
				extrapolate: 'clamp'
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
					replyTo: senderDisplayName
				};
				//Note: trigger to ChatBox.tsx
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
			}
		};

		// Message welcome
		if (message?.sender_id === '0' && !message?.content?.t && message?.username === 'system') {
			return <WelcomeMessage channelId={props.channelId} />;
		}

		const handlePressIn = () => {
			Animated.timing(backgroundColor, {
				toValue: 1,
				duration: 500,
				useNativeDriver: false
			}).start();
		};

		const handlePressOut = () => {
			Animated.timing(backgroundColor, {
				toValue: 0,
				duration: 500,
				useNativeDriver: false
			}).start();
		};

		const bgColor = backgroundColor.interpolate({
			inputRange: [0, 1],
			outputRange: ['transparent', themeValue.secondaryWeight]
		});

		return (
			<Animated.View style={[{ backgroundColor: bgColor }]}>
				{/* <Swipeable
			renderRightActions={renderRightActions}
			ref={swipeableRef}
			overshootRight={false}
			onSwipeableOpen={handleSwipeableOpen}
			hitSlop={{ left: -10 }
		> */}
				<View
					style={[
						styles.messageWrapper,
						(isCombine || preventAction) && { marginTop: 0 },
						hasIncludeMention && styles.highlightMessageMention,
						showHighlightReply && styles.highlightMessageReply
					]}
				>
					{!!messageReferences && !!messageReferences?.message_ref_id && (
						<MessageReferences
							messageReferences={messageReferences}
							preventAction={preventAction}
							isMessageReply={true}
							jumpToRepliedMessage={jumpToRepliedMessage}
							mode={mode}
						/>
					)}
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
						<AvatarMessage
							onPress={onPressInfoUser}
							id={message?.user?.id}
							avatar={messageAvatar}
							username={usernameMessage}
							isShow={!isCombine || !!message?.references?.length || showUserInformation}
						/>
						<Pressable
							style={[styles.rowMessageBox]}
							delayLongPress={300}
							onPressIn={handlePressIn}
							onPressOut={handlePressOut}
							onLongPress={() => {
								if (preventAction) return;
								setIsOnlyEmojiPicker(false);
								onMessageAction({
									type: EMessageBSToShow.MessageAction,
									senderDisplayName,
									message
								});
								dispatch(setSelectedMessage(message));
							}}
						>
							<InfoUserMessage
								onPress={onPressInfoUser}
								senderDisplayName={senderDisplayName}
								isShow={!isCombine || !!message?.references?.length || showUserInformation}
								createTime={message?.create_time}
							/>
							<MessageAttachment message={message} onOpenImage={onOpenImage} onLongPressImage={onLongPressImage} />
							{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
							{/*@ts-expect-error*/}
							<Block opacity={message.isError || (message.isSending && !hasInternet) || message?.isErrorRetry ? 0.6 : 1}>
								{isInviteLink ? (
									<RenderMessageInvite content={contentMessage} />
								) : (
									<RenderTextMarkdownContent
										content={{
											...(typeof message.content === 'object' ? message.content : {}),
											mentions: message.mentions,
											...(checkOneLinkImage ? { t: '' } : {})
										}}
										isEdited={isEdited}
										translate={t}
										onMention={onMention}
										onChannelMention={onChannelMention}
										isNumberOfLine={isNumberOfLine}
										isMessageReply={false}
										mode={mode}
										directMessageId={channelId}
										isOnlyContainEmoji={isOnlyContainEmoji}
									/>
								)}
							</Block>
							{message.isError && <Text style={{ color: 'red' }}>{t('unableSendMessage')}</Text>}
							{!preventAction ? (
								<MessageAction
									message={message}
									mode={mode}
									userProfile={userProfile}
									preventAction={preventAction}
									openEmojiPicker={() => {
										setIsOnlyEmojiPicker(true);
										onMessageAction({
											type: EMessageBSToShow.MessageAction,
											senderDisplayName,
											message
										});
									}}
								/>
							) : null}
						</Pressable>
					</View>
				</View>
				{/* </Swipeable> */}
				<NewMessageRedLine
					channelId={props?.channelId}
					messageId={props?.messageId}
					isEdited={message?.hide_editted}
					isSending={message?.isSending}
					isMe={message.sender_id === userProfile?.user?.id}
				/>
			</Animated.View>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps?.message?.id + prevProps?.message?.update_time + prevProps?.previousMessage?.id ===
			nextProps?.message?.id + nextProps?.message?.update_time + nextProps?.previousMessage?.id
		);
	}
);

export default MessageItem;
