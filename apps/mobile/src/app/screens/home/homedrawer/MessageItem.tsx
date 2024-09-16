import {
	ActionEmitEvent,
	getUpdateOrAddClanChannelCache,
	remove,
	ReplyIcon,
	ReplyMessageDeleted,
	save,
	setDefaultChannelLoader,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_CLAN_ID,
	STORAGE_DATA_CLAN_CHANNEL_CACHE
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
	selectIdMessageToJump,
	useAppDispatch
} from '@mezon/store-mobile';
import { ApiMessageAttachment, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Animated, DeviceEventEmitter, Linking, Platform, Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import { linkGoogleMeet } from '../../../utils/helpers';
import { MessageAction, RenderTextMarkdownContent } from './components';
import { EMessageActionType, EMessageBSToShow } from './enums';
import { style } from './styles';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useSeenMessagePool } from 'libs/core/src/lib/chat/hooks/useSeenMessagePool';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { clansActions, setSelectedMessage } from '@mezon/store';
import { ETypeLinkMedia, isValidEmojiData } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useTranslation } from 'react-i18next';
import { AvatarMessage } from './components/AvatarMessage';
import { InfoUserMessage } from './components/InfoUserMessage';
import { MessageAttachment } from './components/MessageAttachment';
import { MessageReferences } from './components/MessageReferences';
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
		const dispatch = useAppDispatch();
		const { t } = useTranslation('message');
		const message: MessagesEntity = props?.message;
		const previousMessage: MessagesEntity = props?.previousMessage;
		const navigation = useNavigation<any>();

		const { markMessageAsSeen } = useSeenMessagePool();
		const userProfile = useSelector(selectAllAccount);
		const idMessageToJump = useSelector(selectIdMessageToJump);
		const usersClan = useSelector(selectAllUserClans);
		const rolesInClan = useSelector(selectAllRolesClan);

		const checkAnonymous = useMemo(() => message?.sender_id === NX_CHAT_APP_ANNONYMOUS_USER_ID, [message?.sender_id]);
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

		const checkMessageTargetToMoved = useMemo(() => {
			return idMessageToJump === message?.id;
		}, [idMessageToJump, message?.id]);

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
		}, [message.content, message.mentions]);

		useEffect(() => {
			if (props?.messageId) {
				markMessageAsSeen(message);
			}
		}, [markMessageAsSeen, message, props.messageId]);

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

		const onPressAvatar = useCallback(() => {
			if (preventAction) return;
			setIsOnlyEmojiPicker(false);
			onMessageAction({
				type: EMessageBSToShow.UserInformation,
				user: message?.user,
				message
			});
		}, [preventAction, setIsOnlyEmojiPicker, onMessageAction, message]);

		const onPressInfoUser = useCallback(() => {
			if (preventAction) return;
			setIsOnlyEmojiPicker(false);

			onMessageAction({
				type: EMessageBSToShow.UserInformation,
				user: message?.user,
				message
			});
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

		const jumpToChannel = async (channelId: string, clanId: string) => {
			const store = await getStoreAsync();
			// TODO: do we need to jump to message here?
			store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId }));
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
				const clanId = channel?.clan_id;

				if (type === ChannelType.CHANNEL_TYPE_VOICE && channel?.meeting_code) {
					const urlVoice = `${linkGoogleMeet}${channel?.meeting_code}`;
					await Linking.openURL(urlVoice);
				} else if (type === ChannelType.CHANNEL_TYPE_TEXT) {
					handleChangeClan(clanId);
					DeviceEventEmitter.emit(ActionEmitEvent.ON_MENTION_HASHTAG_DM, {
						isMentionHashtagDM: true
					});
					const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
					save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
					await jumpToChannel(channelId, clanId);
				}
			} catch (error) {
				console.log(error);
			}
		}, []);

		const handleChangeClan = useCallback(async (clanId: string) => {
			navigation.navigate('HomeDefault');
			const store = await getStoreAsync();
			await remove(STORAGE_CHANNEL_CURRENT_CACHE);
			save(STORAGE_CLAN_ID, clanId);
			const promises = [];
			promises.push(store.dispatch(clansActions.joinClan({ clanId: clanId })));
			promises.push(store.dispatch(clansActions.changeCurrentClan({ clanId: clanId })));
			promises.push(store.dispatch(channelsActions.fetchChannels({ clanId: clanId, noCache: true })));
			const results = await Promise.all(promises);
			const channelResp = results.find((result) => result.type === 'channels/fetchChannels/fulfilled');
			if (channelResp) {
				await setDefaultChannelLoader(channelResp.payload, clanId);
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
						checkMessageTargetToMoved && styles.highlightMessageReply
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
							onPress={onPressAvatar}
							id={message?.user?.id}
							avatar={messageAvatar}
							username={usernameMessage}
							isShow={!isCombine || !!message?.references?.length || showUserInformation}
						/>
						<Pressable
							style={[styles.rowMessageBox]}
							delayLongPress={Platform.OS === 'ios' ? 300 : 100}
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
							<Block opacity={message.isError ? 0.6 : 1}>
								<RenderTextMarkdownContent
									content={{
										...(typeof message.content === 'object' ? message.content : {}),
										mentions: message.mentions,
										...(checkOneLinkImage ? { t: '' } : {})
									}}
									isEdited={message.hideEditted === false && !!message?.content?.t}
									translate={t}
									onMention={onMention}
									onChannelMention={onChannelMention}
									isNumberOfLine={isNumberOfLine}
									isMessageReply={false}
									mode={mode}
									directMessageId={channelId}
									isOnlyContainEmoji={isOnlyContainEmoji}
								/>
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
				{/*<NewMessageRedLine channelId={props?.channelId} messageId={props?.messageId} isEdited={message?.hideEditted} />*/}
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
