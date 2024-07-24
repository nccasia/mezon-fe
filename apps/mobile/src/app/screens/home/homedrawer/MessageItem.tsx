import {
	ActionEmitEvent,
	getUpdateOrAddClanChannelCache,
	ReplyIcon,
	ReplyMessageDeleted,
	save,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
} from '@mezon/mobile-components';
import { Block, Colors, Text, useTheme } from '@mezon/mobile-ui';
import {
	channelsActions,
	ChannelsEntity,
	getStoreAsync,
	messagesActions,
	MessagesEntity,
	selectAllAccount,
	selectAllEmojiSuggestion,
	selectAllUsesClan,
	selectChannelsEntities,
	selectIdMessageToJump,
	selectMessageEntityById,
	selectUserClanProfileByClanID,
	useAppDispatch,
	UserClanProfileEntity,
} from '@mezon/store-mobile';
import { ApiMessageAttachment, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Animated, DeviceEventEmitter, Linking, Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import { linkGoogleMeet } from '../../../utils/helpers';
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
import { MessageAttachment } from './components/MessageAttachment';
import { MessageReferences } from './components/MessageReferences';
import { IMessageActionNeedToResolve, IMessageActionPayload } from './types';
import WelcomeMessage from './WelcomeMessage';

const NX_CHAT_APP_ANNONYMOUS_USER_ID = process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID || 'anonymous';

export type MessageItemProps = {
	message?: MessagesEntity;
	messageId?: string;
	isMessNotifyMention?: boolean;
	mode: number;
	channelId?: string;
	channelName?: string;
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
	const dispatch = useAppDispatch();
	const { t } = useTranslation('message');
	const selectedMessage = useSelector((state) => selectMessageEntityById(state, props.channelId, props.messageId));
	const message: MessagesEntity = props?.message ? props?.message : (selectedMessage as MessagesEntity);
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const channelsEntities = useSelector(selectChannelsEntities);
	const { markMessageAsSeen } = useSeenMessagePool();
	const userProfile = useSelector(selectAllAccount);
	const clanProfile = useSelector(selectUserClanProfileByClanID(currentClanId as string, message?.user?.id as string));
	const checkAnonymous = useMemo(() => message?.sender_id === NX_CHAT_APP_ANNONYMOUS_USER_ID, [message?.sender_id]);
	const hasIncludeMention = useMemo(() => {
		return message?.content?.t?.includes?.('@here') || message?.content?.t?.includes?.(`@${userProfile?.user?.username}`);
	}, [message, userProfile]);
	const messageReferences = useMemo(() => {
		return message?.references?.[0] as ApiMessageRef;
	}, [message?.references]);

	const isCombine = !message?.isStartedMessageGroup;
	const swipeableRef = React.useRef(null);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const usersClan = useSelector(selectAllUsesClan);
	const checkMessageTargetToMoved = useMemo(() => {
		return idMessageToJump === message?.id;
	}, [idMessageToJump, message?.id]);

	const lines = useMemo(() => {
		return message?.content?.t;
	}, [message?.content?.t]);

	const isMessageReplyDeleted = useMemo(() => {
		return !messageReferences && message?.references && message?.references?.length;
	}, [messageReferences, message.references]);

	useEffect(() => {
		if (props?.messageId) {
			const timestamp = Date.now() / 1000;
			markMessageAsSeen(message);
			dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId: message.channel_id, timestamp }));
		}
	}, [dispatch, markMessageAsSeen, message, props.messageId]);

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
			user: message?.user,
			message,
		});
	}, [preventAction, setIsOnlyEmojiPicker, onMessageAction, message]);

	const onPressInfoUser = useCallback(() => {
		if (preventAction) return;
		setIsOnlyEmojiPicker(false);

		onMessageAction({
			type: EMessageBSToShow.UserInformation,
			user: message?.user,
			message,
		});
	}, [message, onMessageAction, preventAction, setIsOnlyEmojiPicker]);

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

	const isEdited = useMemo(() => {
		if (message?.update_time) {
			const updateDate = new Date(message?.update_time);
			const createDate = new Date(message?.create_time);
			return updateDate > createDate;
		}
		return false;
	}, [message]);

	const senderDisplayName = useMemo(() => {
		return clanProfile?.nick_name || message?.user?.username || (checkAnonymous ? 'Anonymous' : message?.username);
	}, [checkAnonymous, clanProfile?.nick_name, message?.user?.username, message?.username]);

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

	console.log(message.channel_id);
	console.log(props.channelName);


	return (
		message.isStartedMessageGroup && message.sender_id == "0"
			? <WelcomeMessage channelTitle={props.channelName} />
			: <Swipeable
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
					{!!messageReferences && (
						<MessageReferences
							messageReferences={messageReferences}
							preventAction={preventAction}
							jumpToRepliedMessage={jumpToRepliedMessage}
							currentClanId={currentClanId}
							channelsEntities={channelsEntities}
							emojiListPNG={emojiListPNG}
							clansProfile={clansProfile}
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
							avatar={message?.isMe ? userProfile?.user?.avatar_url : message?.user?.avatarSm}
							username={message?.user?.username}
							isShow={!isCombine || !!message?.references?.length || showUserInformation}
						/>
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
								isShow={!isCombine || !!message?.references?.length || showUserInformation}
								createTime={message?.create_time}
							/>
							<MessageAttachment message={message} onOpenImage={onOpenImage} onLongPressImage={onLongPressImage} />
							<Block opacity={message.isError ? 0.6 : 1}>
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
									userProfile={userProfile}
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
