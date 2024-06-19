import { useAuth, useChatReaction } from '@mezon/core';
import {
	ActionEmitEvent,
	CopyIcon,
	FaceIcon,
	FlagIcon,
	HashtagIcon,
	LinkIcon,
	MarkUnreadIcon,
	MentionIcon,
	PenIcon,
	PinMessageIcon,
	ReplyMessageIcon,
	ThreadIcon,
	TrashIcon,
} from '@mezon/mobile-components';
import { Colors, Metrics, size, useAnimatedState } from '@mezon/mobile-ui';
import { AppDispatch, pinMessageActions, selectCurrentChannelId, selectPinMessageByChannelId } from '@mezon/store-mobile';
import { IEmojiImage } from '@mezon/utils';
import Clipboard from '@react-native-clipboard/clipboard';
import { ChannelStreamMode } from 'mezon-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, DeviceEventEmitter, FlatList, Platform, Pressable, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import BottomSheet from 'react-native-raw-bottom-sheet';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { getMessageActions } from '../../constants';
import { EMessageActionType, EMessageBSToShow } from '../../enums';
import { IMessageActionNeedToResolve, IReplyBottomSheet } from '../../types/message.interface';
import EmojiSelector from '../EmojiPicker/EmojiSelector';
import UserProfile from '../UserProfile';
import { emojiFakeData } from '../fakeData';
import { styles } from './styles';

export const MessageItemBS = React.memo((props: IReplyBottomSheet) => {
	const { type, onClose, message, onConfirmDeleteMessage, mode, isOnlyEmojiPicker = false, user } = props;
	const dispatch = useDispatch<AppDispatch>();
	const ref = useRef(null);
	const timeoutRef = useRef(null);
	const [content, setContent] = useState<React.ReactNode>(<View />);
	const { t } = useTranslation(['message']);
	const { userProfile } = useAuth();
	const { reactionMessageDispatch } = useChatReaction();
	const [isShowEmojiPicker, setIsShowEmojiPicker] = useAnimatedState(false);
	const handleActionEditMessage = () => {
		onClose();
		const payload: IMessageActionNeedToResolve = {
			type: EMessageActionType.EditMessage,
			targetMessage: message,
		};
		//Note: trigger to ChatBox.tsx
		DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
	};
	const listPinMessages = useSelector(selectPinMessageByChannelId(message.channel_id));
	const currentChannelId = useSelector(selectCurrentChannelId);

	const handleActionReply = () => {
		onClose();
		const payload: IMessageActionNeedToResolve = {
			type: EMessageActionType.Reply,
			targetMessage: message,
		};
		//Note: trigger to ChatBox.tsx
		DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
	};

	const handleActionCreateThread = () => {
		onClose();
		const payload: IMessageActionNeedToResolve = {
			type: EMessageActionType.CreateThread,
			targetMessage: message,
		};
		DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
	};

	const handleActionCopyText = () => {
		onClose();
		Clipboard.setString(message.content.t);
		Toast.show({
			type: 'success',
			props: {
				text2: t('toast.copyText'),
				leadingIcon: <CopyIcon color={Colors.bgGrayLight} />,
			},
		});
	};

	const handleActionDeleteMessage = () => {
		onClose();
		Alert.alert(
			'Delete Message',
			'Are you sure you want to delete this message?',
			[
				{
					text: 'No',
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel',
				},
				{ text: 'Yes', onPress: () => onConfirmDeleteMessage() },
			],
			{ cancelable: false },
		);
	};

	const handleActionPinMessage = () => {
    if(message)
		onClose();
		dispatch(pinMessageActions.setChannelPinMessage({ channel_id: message.channel_id, message_id: message.id }));
	};

	const handleActionUnPinMessage = () => {
    if(message)
		onClose();
		dispatch(pinMessageActions.deleteChannelPinMessage({ channel_id: currentChannelId || '', message_id: message.id }));
	};

	const handleActionMarkUnRead = () => {
		console.log('MarkUnRead');
	};

	const handleActionMention = () => {
		onClose();
		const payload: IMessageActionNeedToResolve = {
			type: EMessageActionType.Mention,
			targetMessage: message,
		};
		DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
	};

	const handleActionCopyMessageLink = () => {
		console.log('CopyMessageLink');
	};

	const handleActionReportMessage = () => {
		console.log('CopyMessageLink');
	};

	const handleForwardMessage = () => {
		onClose();
		const payload: IMessageActionNeedToResolve = {
			type: EMessageActionType.ForwardMessage,
			targetMessage: message,
		};
		timeoutRef.current = setTimeout(() => {
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_FORWARD_MODAL, payload);
		}, 500);
	};

	const implementAction = (type: EMessageActionType) => {
		switch (type) {
			case EMessageActionType.EditMessage:
				handleActionEditMessage();
				break;
			case EMessageActionType.Reply:
				handleActionReply();
				break;
			case EMessageActionType.CreateThread:
				handleActionCreateThread();
				break;
			case EMessageActionType.CopyText:
				handleActionCopyText();
				break;
			case EMessageActionType.DeleteMessage:
				handleActionDeleteMessage();
				break;
			case EMessageActionType.PinMessage:
				handleActionPinMessage();
				break;
			case EMessageActionType.UnPinMessage:
				handleActionUnPinMessage();
				break;
			case EMessageActionType.MarkUnRead:
				handleActionMarkUnRead();
				break;
			case EMessageActionType.Mention:
				handleActionMention();
				break;
			case EMessageActionType.CopyMessageLink:
				handleActionCopyMessageLink();
				break;
			case EMessageActionType.Report:
				handleActionReportMessage();
				break;
			case EMessageActionType.ForwardMessage:
				handleForwardMessage();
				break;
			default:
				break;
		}
	};

	const getActionMessageIcon = (type: EMessageActionType) => {
		switch (type) {
			case EMessageActionType.EditMessage:
				return <PenIcon />;
			case EMessageActionType.Reply:
				return <ReplyMessageIcon />;
			case EMessageActionType.ForwardMessage:
				return <ReplyMessageIcon />;
			case EMessageActionType.CreateThread:
				return <ThreadIcon width={20} height={20} />;
			case EMessageActionType.CopyText:
				return <CopyIcon />;
			case EMessageActionType.DeleteMessage:
				return <TrashIcon />;
			case EMessageActionType.PinMessage:
				return <PinMessageIcon />;
			case EMessageActionType.UnPinMessage:
				return <PinMessageIcon />;
			case EMessageActionType.MarkUnRead:
				return <MarkUnreadIcon />;
			case EMessageActionType.Mention:
				return <MentionIcon />;
			case EMessageActionType.CopyMessageLink:
				return <LinkIcon />;
			case EMessageActionType.Report:
				return <FlagIcon />;
			default:
				return <View />;
		}
	};

	const messageActionList = useMemo(() => {
		const isMyMessage = userProfile?.user?.id === message?.user?.id;
		const messageExists = listPinMessages.some((pinMessage) => pinMessage.message_id === message.id);
		const listOfActionOnlyMyMessage = [
			EMessageActionType.EditMessage,
			EMessageActionType.DeleteMessage,
			messageExists ? EMessageActionType.PinMessage : EMessageActionType.UnPinMessage,
		];
		const listOfActionOnlyOtherMessage = [
			EMessageActionType.Report,
			messageExists ? EMessageActionType.PinMessage : EMessageActionType.UnPinMessage,
		];
		if (isMyMessage) {
			return getMessageActions(t).filter((action) => !listOfActionOnlyOtherMessage.includes(action.type));
		}

		return getMessageActions(t).filter((action) => !listOfActionOnlyMyMessage.includes(action.type));
	}, [t, userProfile, message, listPinMessages]);

	const renderUserInformation = () => {
		return <UserProfile userId={user?.id}></UserProfile>;
	};

	const handleReact = async (mode, messageId, emoji: IEmojiImage, senderId) => {
		await reactionMessageDispatch('', mode, messageId || '', emoji.shortname, 1, senderId ?? '', false);
		onClose();
	};

	const renderMessageItemActions = () => {
		return (
			<View style={styles.messageActionsWrapper}>
				<View style={styles.reactWrapper}>
					{emojiFakeData.map((item, index) => {
						return (
							<Pressable
								key={index}
								onPress={() => handleReact(mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL, message.id, item, userProfile.user.id)}
							>
								<FastImage
									source={{
										uri: item.src,
									}}
									resizeMode={'contain'}
									style={{
										width: size.s_28,
										height: size.s_28,
									}}
								/>
							</Pressable>
						);
					})}

					<Pressable onPress={() => setIsShowEmojiPicker(true)} style={{ width: size.s_28, height: size.s_28 }}>
						<FaceIcon color={Colors.white} />
					</Pressable>
				</View>
				<FlatList
					data={messageActionList}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<Pressable style={styles.actionItem} onPress={() => implementAction(item.type)}>
							<View style={styles.icon}>{getActionMessageIcon(item.type)}</View>
							<Text style={styles.actionText}>{item.title}</Text>
						</Pressable>
					)}
				/>
			</View>
		);
	};

	const onSelectEmoji = async (emoij: string) => {
		setIsShowEmojiPicker(false);
		await handleReact(mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL, message.id, { shortname: emoij }, userProfile.user.id);
	};

	const renderEmojiSelector = () => {
		return (
			<View style={{ padding: size.s_10 }}>
				<EmojiSelector onSelected={onSelectEmoji} isReactMessage />
			</View>
		);
	};

	const setVisibleBottomSheet = (isShow: boolean) => {
		if (ref) {
			if (isShow) {
				ref.current.open();
			} else {
				ref.current.close();
			}
		}
	};

	useEffect(() => {
		return () => {
			timeoutRef.current && clearTimeout(timeoutRef.current);
		};
	}, []);

	useEffect(() => {
		switch (type) {
			case EMessageBSToShow.MessageAction:
				setVisibleBottomSheet(true);
				if (isShowEmojiPicker || isOnlyEmojiPicker) {
					setContent(renderEmojiSelector());
				} else {
					setContent(renderMessageItemActions());
				}
				break;
			case EMessageBSToShow.UserInformation:
				setVisibleBottomSheet(true);
				setContent(renderUserInformation());
				break;
			default:
				setVisibleBottomSheet(false);
				setContent(<View />);
		}
	}, [type, isShowEmojiPicker, isOnlyEmojiPicker]);

	return (
		<BottomSheet
			ref={ref}
			height={
				isShowEmojiPicker || isOnlyEmojiPicker || [EMessageBSToShow.UserInformation].includes(type)
					? Metrics.screenHeight / 1.4
					: Metrics.screenHeight / 2
			}
			onClose={() => {
				onClose();
				setIsShowEmojiPicker(false);
			}}
			draggable
			dragOnContent={!(isShowEmojiPicker || isOnlyEmojiPicker || [EMessageBSToShow.UserInformation].includes(type)) && Platform.OS !== 'ios'}
			customStyles={{
				container: {
					backgroundColor: 'transparent',
				},
			}}
		>
			<View style={styles.bottomSheetWrapper}>{content}</View>
		</BottomSheet>
	);
});
