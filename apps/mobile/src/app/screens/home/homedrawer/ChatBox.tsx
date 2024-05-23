import { useChatSending } from '@mezon/core';
import { AngleRightIcon, GiftIcon, MicrophoneIcon, SendIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { IMessageWithUser } from '@mezon/utils';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, Dimensions, Keyboard, TextInput, View, Text, Pressable, Platform, KeyboardEvent } from 'react-native';
import { useThrottledCallback } from 'use-debounce';
import { IKeyboardType } from './components';
import AttachmentSwitcher from './components/AttachmentPicker/AttachmentSwitcher';
import EmojiSwitcher from './components/EmojiPicker/EmojiSwitcher';
import { EMessageActionType } from './enums';
import { styles } from './styles';
import AttachmentPicker from "./components/AttachmentPicker";
import { useSelector } from 'react-redux';
import { selectMemberByUserId, selectMessageByMessageId } from '@mezon/store';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { ApiMessageRef } from 'mezon-js/api.gen';
import { IMessageActionNeedToResolve } from './types';

const inputWidthWhenHasInput = Dimensions.get('window').width * 0.7;

interface IChatBoxProps {
	channelLabel: string;
	channelId: string;
	mode: number;
	onShowKeyboardBottomSheet: (isShow: boolean, height: number, type?: string) => void;
}
const ChatBox = memo((props: IChatBoxProps) => {
	const inputRef = useRef<any>();
	const [modeKeyBoardBottomSheet, setModeKeyBoardBottomSheet] = useState<IKeyboardType>('text');
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { sendMessage, sendMessageTyping, EditSendMessage } = useChatSending({ channelId: props.channelId, channelLabel: props.channelLabel, mode: props.mode });
	const [messageActionListNeedToResolve, setMessageActionListNeedToResolve] = useState<IMessageActionNeedToResolve[]>([]);
	const [text, setText] = useState<string>('');
	const [currentSelectedReplyMessage, setCurrentSelectedReplyMessage] = useState<IMessageWithUser | null>(null);
	const [currentSelectedEditMessage, setCurrentSelectedEditMessage] = useState<IMessageWithUser | null>(null);
	const [isFocus, setIsFocus] = useState<boolean>(false);
	const [senderId, setSenderId] = useState<string>('');
	const senderMessage = useSelector(selectMemberByUserId(senderId));
	const [keyboardHeight, setKeyboardHeight] = useState<number>(Platform.OS === 'ios' ? 345 : 274);

	const { t } = useTranslation(['message']);

	const editMessage = useCallback(
		(editMessage: string, messageId: string) => {
			EditSendMessage(editMessage, messageId);
		},
		[EditSendMessage],
	);

	const removeMessageActionByType = useCallback((type: EMessageActionType) => {
		const newStack = [...messageActionListNeedToResolve.filter(it => it.type !== type)];
		setMessageActionListNeedToResolve(newStack);
	}, [messageActionListNeedToResolve])

	const removeAction = useCallback((actionType: EMessageActionType) => {
		switch (actionType) {
			case EMessageActionType.Reply:
				setSenderId('');
				removeMessageActionByType(EMessageActionType.Reply);
				setCurrentSelectedReplyMessage(null);
				break;
			case EMessageActionType.EditMessage:
				setCurrentSelectedEditMessage(null);
				removeMessageActionByType(EMessageActionType.EditMessage);
				setText('');
				break;
			default:
				break;
		}
	}, [removeMessageActionByType])

	const handleSendMessage = useCallback(() => {
		const isEditMessage = messageActionListNeedToResolve[messageActionListNeedToResolve.length - 1]?.type === EMessageActionType.EditMessage;
		if (isEditMessage) {
			editMessage(text, currentSelectedEditMessage.id);
			removeAction(EMessageActionType.EditMessage);
		} else {
			const reference = currentSelectedReplyMessage ? [{
				message_id: '',
				message_ref_id: currentSelectedReplyMessage.id,
				ref_type: 0,
				message_sender_id: currentSelectedReplyMessage.user.id,
				content: JSON.stringify(currentSelectedReplyMessage.content),
				has_attachment: Boolean(currentSelectedReplyMessage.attachments.length),
			}] : undefined;

			sendMessage({ t: text }, [], [], reference, false);
			removeAction(EMessageActionType.Reply);
		}
		setText('');
	}, [sendMessage, text, currentSelectedReplyMessage, messageActionListNeedToResolve, currentSelectedEditMessage, editMessage, removeAction]);

	const handleTyping = useCallback(() => {
		sendMessageTyping();
	}, [sendMessageTyping]);

	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

	useEffect(() => {
		messageActionListNeedToResolve.forEach((item) => {
			const { targetMessage, type } = item;
			switch (type) {
				case EMessageActionType.Reply:
					setCurrentSelectedReplyMessage(targetMessage);
					setSenderId(targetMessage.sender_id);
					break;
				case EMessageActionType.EditMessage:
					setCurrentSelectedEditMessage(targetMessage);
					setText(targetMessage.content.t);
					break;
				default:
					setSenderId('');
					break;
			}
		})
	}, [messageActionListNeedToResolve])



	const sortMessageActionList = (a: IMessageActionNeedToResolve, b: IMessageActionNeedToResolve) => {
		if (a.type === EMessageActionType.EditMessage && b.type !== EMessageActionType.EditMessage) {
			return 1;
		}
		if (a.type !== EMessageActionType.EditMessage && b.type === EMessageActionType.EditMessage) {
			return -1;
		}
		return 0;
	}

	const pushMessageActionIntoStack = useCallback((messagePayload: IMessageActionNeedToResolve) => {
		const isExistingAction = messageActionListNeedToResolve.some(it => it.type === messagePayload.type);
		if (isExistingAction) {
			const newStack = [...messageActionListNeedToResolve.filter(it => it.type !== messagePayload.type), { ...messagePayload }].sort(sortMessageActionList);
			setMessageActionListNeedToResolve(newStack);
		} else {
			setMessageActionListNeedToResolve(preValue => [...preValue, { ...messagePayload }].sort(sortMessageActionList))
		}
	}, [messageActionListNeedToResolve])

	function keyboardWillShow(event: KeyboardEvent) {
		if (keyboardHeight !== event.endCoordinates.height) {
			setKeyboardHeight(event.endCoordinates.height);
		}
	}

	useEffect(() => {
		const keyboardListener = Keyboard.addListener('keyboardDidShow', keyboardWillShow);
		const showKeyboard = DeviceEventEmitter.addListener(
			'@SHOW_KEYBOARD',
			(value) => {
				//NOTE: trigger from message action 'MessageItemBS component'
				resetInput();
				pushMessageActionIntoStack(value);
				openKeyBoard();
			},
		);

		return () => {
			showKeyboard.remove();
			resetInput();
			keyboardListener.remove();
		};
	}, [pushMessageActionIntoStack]);

	const openKeyBoard = () => {
		timeoutRef.current = setTimeout(() => {
			inputRef.current.focus();
			setIsFocus(true);
		}, 300);
	};

	const resetInput = () => {
		setIsFocus(false);
		inputRef.current?.blur();
		if (timeoutRef) {
			clearTimeout(timeoutRef.current);
		}
	};

	function handleKeyboardBottomSheetMode(mode: IKeyboardType) {
		setModeKeyBoardBottomSheet(mode);
		if (mode === 'emoji' || mode === 'attachment') {
			props.onShowKeyboardBottomSheet(true, keyboardHeight, mode);
		} else {
			inputRef && inputRef.current && inputRef.current.focus();
			props.onShowKeyboardBottomSheet(false, keyboardHeight);
		}
	}

	function handleInputFocus() {
		setModeKeyBoardBottomSheet('text');
		inputRef && inputRef.current && inputRef.current.focus();
		props.onShowKeyboardBottomSheet(false, keyboardHeight);
	}

	function handleInputBlur() {
		if (modeKeyBoardBottomSheet === 'text')
			props.onShowKeyboardBottomSheet(false, 0);
	}

	return (
		<View style={styles.wrapperChatBox}>
			<View style={styles.aboveTextBoxWrapper}>
				{senderMessage?.user?.username ? (
					<View style={styles.aboveTextBoxItem}>
						<Pressable onPress={() => removeAction(EMessageActionType.Reply)}>
							<Feather size={25} name="x" style={styles.closeIcon} />
						</Pressable>
						<Text style={styles.aboveTextBoxText}>
							{t('chatBox.replyingTo')} {senderMessage?.user?.username}
						</Text>
					</View>
				) : null}
				{currentSelectedEditMessage ? (
					<View style={styles.aboveTextBoxItem}>
						<Pressable onPress={() => removeAction(EMessageActionType.EditMessage)}>
							<Feather size={25} name='x' style={styles.closeIcon} />
						</Pressable>
						<Text style={styles.aboveTextBoxText}>{t('chatBox.editingMessage')}</Text>
					</View>
				) : null}
			</View>
			<View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 }}>
				{text.length > 0 ? (
					<View style={[styles.iconContainer, { backgroundColor: '#333333' }]}>
						<AngleRightIcon width={18} height={18} />
					</View>
				) : (
					<>
						<View style={[styles.iconContainer, { backgroundColor: '#333333' }]}>
							<AttachmentSwitcher onChange={handleKeyboardBottomSheetMode} mode={modeKeyBoardBottomSheet} />
						</View>
						<View style={[styles.iconContainer, { backgroundColor: '#333333' }]}>
							<GiftIcon width={22} height={22} />
						</View>
					</>
				)}

				<View style={{ position: 'relative', justifyContent: 'center' }}>
					<TextInput
						autoFocus={isFocus}
						placeholder={'Write your thoughts here...'}
						placeholderTextColor={Colors.textGray}
						onChangeText={(text: string) => {
							setText(text);
							handleTypingDebounced();
						}}
						defaultValue={text}
						blurOnSubmit={false}
						ref={inputRef}
						onSubmitEditing={handleSendMessage}
						onFocus={handleInputFocus}
						onBlur={handleInputBlur}
						style={[
							styles.inputStyle,
							text.length > 0 && { width: inputWidthWhenHasInput },
							{ backgroundColor: Colors.tertiaryWeight, color: Colors.tertiary },
						]}
					/>

					<View style={styles.iconEmoji}>
						<EmojiSwitcher
							onChange={handleKeyboardBottomSheetMode}
							mode={modeKeyBoardBottomSheet} />
					</View>

				</View>

				<View style={[styles.iconContainer, { backgroundColor: '#2b2d31' }]}>
					{text.length > 0 ? (
						<View onTouchEnd={handleSendMessage} style={[styles.iconContainer, styles.iconSend]}>
							<SendIcon width={18} height={18} />
						</View>
					) : (
						<MicrophoneIcon width={22} height={22} />
					)}
				</View>
			</View>
		</View>
	);
});

export default ChatBox;
