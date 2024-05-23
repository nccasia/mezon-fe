import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, Pressable, FlatList, DeviceEventEmitter, Alert } from 'react-native';
import BottomSheet from 'react-native-raw-bottom-sheet';
import { styles } from './styles';
import { IMessageActionNeedToResolve, IReplyBottomSheet } from '../../types/message.interface';
import { EMessageActionType, EMessageBSToShow } from '../../enums';
import { useTranslation } from 'react-i18next';
import { getMessageActions } from '../../constants';
import { useAuth, useChatReaction } from '@mezon/core';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { ActionEmitEvent, CopyIcon, FlagIcon, HashtagIcon, LinkIcon, MarkUnreadIcon, MentionIcon, PenIcon, PinMessageIcon, ReplyMessageIcon, TrashIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { emojiFakeData } from '../fakeData';
import { IEmoji } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';

export const MessageItemBS = React.memo((props: IReplyBottomSheet) => {
    const { type, onClose, message, onConfirmDeleteMessage, mode } = props;
    const ref = useRef(null);
    const [content, setContent] = useState<React.ReactNode>(<View />);
    const { t } = useTranslation(['message']);
    const { userProfile } = useAuth();
    const {
		reactionMessageDispatch
	} = useChatReaction();

    const handleActionEditMessage = () => {
        onClose();
        const payload: IMessageActionNeedToResolve = {
            type: EMessageActionType.EditMessage,
            targetMessage: message
        }
        //Note: trigger to ChatBox.tsx
        DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
    }

    const handleActionReply = () => {
        onClose();
        const payload: IMessageActionNeedToResolve = {
            type: EMessageActionType.Reply,
            targetMessage: message
        }
        //Note: trigger to ChatBox.tsx
        DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
    }

    const handleActionCreateThread = () => {
      onClose();
      const payload: IMessageActionNeedToResolve = {
        type: EMessageActionType.CreateThread,
        targetMessage: message
    }
      DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
    }

    const handleActionCopyText = () => {
        onClose();
        Clipboard.setString(message.content.t);
        Toast.show({
            type: 'success',
            props: {
                text2: t('toast.copyText'),
                leadingIcon: <CopyIcon color={Colors.bgGrayLight} />
            }
        });
    }

    const handleActionDeleteMessage = () => {
        onClose()
        //TODO: replace with modal
        Alert.alert(
            "Delete Message",
            "Are you sure you want to delete this message?",
            [
              {
                text: "No",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "Yes", onPress: () => onConfirmDeleteMessage() }
            ],
            { cancelable: false }
        );
    }

    const handleActionPinMessage = () => {
        console.log('PinMessage');
    }

    const handleActionMarkUnRead = () => {
        console.log('MarkUnRead');
    }

    const handleActionMention = () => {
      onClose();
      const payload: IMessageActionNeedToResolve = {
        type: EMessageActionType.Mention,
        targetMessage: message
    }
      DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, payload);
    }

    const handleActionCopyMessageLink = () => {
        console.log('CopyMessageLink');
    }

    const handleActionReportMessage = () => {
        console.log('CopyMessageLink');
    }

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
            default:
                break;
        }
    }

    const getActionMessageIcon = (type: EMessageActionType) => {
        switch (type) {
            case EMessageActionType.EditMessage:
                return <PenIcon />;
            case EMessageActionType.Reply:
                return <ReplyMessageIcon />;
            case EMessageActionType.CreateThread:
                return <HashtagIcon />;
            case EMessageActionType.CopyText:
                return <CopyIcon />;
            case EMessageActionType.DeleteMessage:
                return <TrashIcon />;
            case EMessageActionType.PinMessage:
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
    }

    const messageActionList = useMemo(() => {
        const isMyMessage = userProfile?.user?.id === message?.user?.id;

        const listOfActionOnlyMyMessage =  [EMessageActionType.EditMessage, EMessageActionType.DeleteMessage];
        const listOfActionOnlyOtherMessage =  [EMessageActionType.Report];
        if (isMyMessage) {
            return getMessageActions(t).filter(action => !listOfActionOnlyOtherMessage.includes(action.type));
        }
        return getMessageActions(t).filter(action => !listOfActionOnlyMyMessage.includes(action.type));
    }, [t, userProfile, message])

    const renderUserInformation = () => {
        return (
            <View>
                <Text>user information</Text>
            </View>
        )
    }

    const handleReact = async (mode, messageId, emoji: IEmoji, senderId) => {
        await reactionMessageDispatch(
            '',
            mode,
            messageId || '',
            emoji.emoji,
            1,
            senderId ?? '',
            false,
        );
        onClose();
    }

    const renderMessageItemActions = () => {
        return (
            <View style={styles.messageActionsWrapper}>
                <View style={styles.reactWrapper}>
                    {emojiFakeData.map((item, index) => {
                        return (
                            <Pressable key={index} onPress={() => handleReact(mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL, message.id, item, userProfile.user.id)}>
                                <Text style={styles.reactIcon}>{item.emoji}</Text>
                            </Pressable>
                        )
                    })}

                {/* <Pressable onPress={() => openEmojiPicker()} style={{width: 20, height: 20, backgroundColor: 'red', borderRadius: 50}}>
                    <FaceIcon color={Colors.white} />
                </Pressable> */}
                </View>
                <FlatList
                    data={messageActionList}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Pressable style={styles.actionItem} onPress={() => implementAction(item.type)}>
                            <View style={styles.icon}>
                                {getActionMessageIcon(item.type)}
                            </View>
                            <Text style={styles.actionText}>{item.title}</Text>
                        </Pressable>
                    )}
                />
            </View>
        )
    }

    const setVisibleBottomSheet = (isShow: boolean) => {
        if (ref) {
            if (isShow) {
                ref.current.open();
            } else {
                ref.current.close();
            }
        }
    }

    useEffect(() => {
        switch (type) {
            case EMessageBSToShow.MessageAction:
                setVisibleBottomSheet(true);
                setContent(renderMessageItemActions());
                break;
            case EMessageBSToShow.UserInformation:
                setVisibleBottomSheet(true);
                setContent(renderUserInformation());
                break;
            default:
                setVisibleBottomSheet(false);
                setContent(<View />);
        }
    }, [type])

    return (
        <BottomSheet
            ref={ref}
            height={500}
            onClose={() => onClose()}
            draggable
            dragOnContent
            customStyles={{
            container: {
                backgroundColor: 'transparent'
            }
        }}>
            <View style={styles.bottomSheetWrapper}>
                {content}
            </View>
        </BottomSheet>
    )
})
