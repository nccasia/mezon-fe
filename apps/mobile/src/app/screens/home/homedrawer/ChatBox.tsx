import { useChannelMembers, useChannels, useChatSending, useDirectMessages, useEmojiSuggestion, useReference, useThreads } from '@mezon/core';
import {
	ActionEmitEvent,
	Icons,
	STORAGE_KEY_TEMPORARY_ATTACHMENT,
	STORAGE_KEY_TEMPORARY_INPUT_MESSAGES,
	convertMentionsToText,
	getAttachmentUnique,
	load,
	save,
} from '@mezon/mobile-components';
import { Colors, baseColor, size, useTheme } from '@mezon/mobile-ui';
import { RootState, selectAllEmojiSuggestion, selectChannelsEntities, selectCurrentChannel } from '@mezon/store-mobile';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import {
	ChannelMembersEntity,
	IMessageSendPayload,
	IMessageWithUser,
	MIN_THRESHOLD_CHARS,
	MentionDataProps,
	UserMentionsOpt,
	typeConverts,
} from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Dimensions, Keyboard, KeyboardEvent, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TriggersConfig, useMentions } from 'react-native-controlled-mentions';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import { ChannelsMention, EmojiSuggestion, HashtagSuggestions, Suggestions } from '../../../components/Suggestions';
import UseMentionList from '../../../hooks/useUserMentionList';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { IModeKeyboardPicker } from './components';
import AttachmentSwitcher from './components/AttachmentPicker/AttachmentSwitcher';
import { IFile } from './components/AttachmentPicker/Gallery';
import AttachmentPreview from './components/AttachmentPreview';
import EmojiSwitcher from './components/EmojiPicker/EmojiSwitcher';
import { renderTextContent } from './components/RenderTextContent';
import { EMessageActionType } from './enums';
import { style } from './styles';
import { IMessageActionNeedToResolve, IPayloadThreadSendMessage } from './types';

export const triggersConfig: TriggersConfig<'mention' | 'hashtag' | 'emoji'> = {
	mention: {
		trigger: '@',
		allowedSpacesCount: 0,
		isInsertSpaceAfterMention: true,
	},
	hashtag: {
		trigger: '#',
		allowedSpacesCount: 0,
		isInsertSpaceAfterMention: true,
		textStyle: {
			fontWeight: 'bold',
			color: Colors.white,
		},
	},
	emoji: {
		trigger: ':',
		allowedSpacesCount: 0,
		isInsertSpaceAfterMention: true,
	},
};
const inputWidthWhenHasInput = Dimensions.get('window').width * 0.7;
interface IChatBoxProps {
	channelLabel: string;
	channelId: string;
	mode: ChannelStreamMode;
	messageAction?: EMessageActionType;
	onShowKeyboardBottomSheet: (isShow: boolean, height: number, type?: string) => void;
	hiddenIcon?: {
		threadIcon: boolean;
	};
	directMessageId?: string;
}
const ChatBox = memo((props: IChatBoxProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const inputRef = useRef<TextInput>();
	const { sessionRef, clientRef } = useMezon();
	const [modeKeyBoardBottomSheet, setModeKeyBoardBottomSheet] = useState<IModeKeyboardPicker>('text');
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [mentionTextValue, setMentionTextValue] = useState('');
	const [mentionData, setMentionData] = useState<ApiMessageMention[]>([]);
	const { members } = useChannelMembers({ channelId: props.channelId });
	const currentChannel = useSelector(selectCurrentChannel);
	const listMentions = UseMentionList(props?.channelId || '');
	const { listChannels } = useChannels();
	const { textInputProps, triggers } = useMentions({
		value: mentionTextValue,
		onChange: (newValue) => handleTextInputChange(newValue),
		onSelectionChange: (position) => {
			handleSelectionChange(position);
		},
		triggersConfig,
	});
	const [listChannelsMention, setListChannelsMention] = useState<ChannelsMention[]>([]);
	const { sendMessage, sendMessageTyping, EditSendMessage } = useChatSending({
		channelId: props.channelId,
		mode: props.mode,
		directMessageId: props?.channelId,
	});
	const [messageActionListNeedToResolve, setMessageActionListNeedToResolve] = useState<IMessageActionNeedToResolve[]>([]);
	const [text, setText] = useState<string>('');
	const [isShowAttachControl, setIsShowAttachControl] = useState<boolean>(false);
	const [currentSelectedReplyMessage, setCurrentSelectedReplyMessage] = useState<IMessageWithUser | null>(null);
	const [currentSelectedEditMessage, setCurrentSelectedEditMessage] = useState<IMessageWithUser | null>(null);
	const [isFocus, setIsFocus] = useState<boolean>(false);
	const [keyboardHeight, setKeyboardHeight] = useState<number>(Platform.OS === 'ios' ? 345 : 274);
	const [isShowEmojiNativeIOS, setIsShowEmojiNativeIOS] = useState<boolean>(false);
	const navigation = useNavigation<any>();
	const { setValueThread } = useThreads();
	const { setOpenThreadMessageState } = useReference();
	const { attachmentDataRef, setAttachmentData } = useReference();
	const { t } = useTranslation(['message']);
	const cursorPositionRef = useRef(0);
	const currentTextInput = useRef('');
	const mentions = useRef([]);
	const { emojiPicked } = useEmojiSuggestion();
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const channelsEntities = useSelector(selectChannelsEntities);
	const { setEmojiSuggestion } = useEmojiSuggestion();
	const [heightInput, setHeightInput] = useState(size.s_40);
	const [replyDisplayName, setReplyDisplayName] = useState('');

	useEffect(() => {
		handleEventAfterEmojiPicked();
	}, [emojiPicked]);

	const getAllCachedMessage = async () => {
		const allCachedMessage = await load(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES);
		return allCachedMessage;
	};

	const getAllCachedAttachments = async () => {
		const allCachedAttachment = await load(STORAGE_KEY_TEMPORARY_ATTACHMENT);
		return allCachedAttachment || {};
	}

	const saveMessageToCache = async (text: string) => {
		const allCachedMessage = await getAllCachedMessage();
		save(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES, {
			...allCachedMessage,
			[props?.channelId]: text,
		});
	};

	async function saveAttachmentToCache(attachment: any) {
		const allCachedAttachments = await getAllCachedAttachments();
		save(STORAGE_KEY_TEMPORARY_ATTACHMENT, {
			...allCachedAttachments,
			[props?.channelId]: attachment,
		});
	}

	const setMessageFromCache = async () => {
		const allCachedMessage = await getAllCachedMessage();
		setText(convertMentionsToText(allCachedMessage?.[props?.channelId] || ''));
	};

	const setAttachmentFromCache = async () => {
		const allCachedAttachment = await getAllCachedAttachments();
		setAttachmentData(allCachedAttachment?.[props?.channelId] || []);
	};

	const resetCachedText = async () => {
		const allCachedMessage = await getAllCachedMessage();
		delete allCachedMessage?.[props?.channelId];
		save(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES, {
			...allCachedMessage,
		});
	};

	const resetCachedAttachment = async () => {
		const allCachedAttachments = await getAllCachedAttachments();
		delete allCachedAttachments[props?.channelId];
		save(STORAGE_KEY_TEMPORARY_ATTACHMENT, {
			...allCachedAttachments,
		});
	};

	useEffect(() => {
		if (props?.channelId) {
			setMessageFromCache();
			setAttachmentFromCache();
		}
	}, [props?.channelId]);

	//start: DM stuff
	const { sendDirectMessage, sendMessageTyping: directMessageTyping } = useDirectMessages({
		channelId: props.channelId ?? '',
		mode: props.mode,
	});
	const sessionUser = useSelector((state: RootState) => state.auth.session);
	const handleSendDM = useCallback(
		(
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
		) => {
			if (sessionUser) {
				sendDirectMessage(content, mentions, attachments, references);
			} else {
				console.error('Session is not available');
			}
		},
		[sendDirectMessage, sessionUser],
	);

	const handleDirectMessageTyping = useCallback(() => {
		directMessageTyping();
	}, [directMessageTyping]);

	const handleDirectMessageTypingDebounced = useThrottledCallback(handleDirectMessageTyping, 1000);
	//end: DM stuff

	useEffect(() => {
		mentions.current = listMentions || [];
	}, [listMentions]);

	useEffect(() => {
		if (props?.channelId) {
			removeAction(EMessageActionType.EditMessage);
		}
	}, [props?.channelId]);

	const handleEventAfterEmojiPicked = () => {
		if (!emojiPicked) {
			return;
		}
		setText(`${text?.endsWith(' ') ? text : text + ' '}${emojiPicked?.toString()} `);
	};

	const editMessage = useCallback(
		(editMessage: string, messageId: string) => {
			EditSendMessage(editMessage?.trim(), messageId);
		},
		[EditSendMessage],
	);

	const removeMessageActionByType = useCallback(
		(type: EMessageActionType) => {
			const newStack = [...messageActionListNeedToResolve.filter((it) => it.type !== type)];
			setMessageActionListNeedToResolve(newStack);
		},
		[messageActionListNeedToResolve],
	);

	const removeAction = useCallback(
		(actionType: EMessageActionType) => {
			switch (actionType) {
				case EMessageActionType.Reply:
					setReplyDisplayName('');
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
		},
		[removeMessageActionByType],
	);

	const isCanSendMessage = useMemo(() => {
		return !!attachmentDataRef?.length || text?.length > 0;
	}, [attachmentDataRef?.length, text?.length]);

	const handleSendMessage = useCallback(() => {
		if (!isCanSendMessage) {
			return;
		}
		const payloadThreadSendMessage: IPayloadThreadSendMessage = {
			content: { t: text },
			mentions: mentionData,
			attachments: [],
			references: [],
		};
		const attachmentDataUnique = getAttachmentUnique(attachmentDataRef);
		const checkAttachmentLoading = attachmentDataUnique.some((attachment: ApiMessageAttachment) => !attachment?.size);
		if (checkAttachmentLoading && !!attachmentDataUnique?.length) {
			Toast.show({
				type: 'error',
				text1: t('toast.attachmentIsLoading'),
			});
			return;
		}
		const isEditMessage = messageActionListNeedToResolve?.[messageActionListNeedToResolve?.length - 1]?.type === EMessageActionType.EditMessage;
		if (isEditMessage) {
			editMessage(text, currentSelectedEditMessage.id);
			removeAction(EMessageActionType.EditMessage);
		} else {
			const reference = currentSelectedReplyMessage
				? [
					{
						message_id: '',
						message_ref_id: currentSelectedReplyMessage.id,
						ref_type: 0,
						message_sender_id: currentSelectedReplyMessage?.user?.id,
						content: JSON.stringify(currentSelectedReplyMessage.content),
						has_attachment: Boolean(currentSelectedReplyMessage?.attachments?.length),
					},
				]
				: undefined;
			setEmojiSuggestion('');
			if (![EMessageActionType.CreateThread].includes(props.messageAction)) {
				switch (props.mode) {
					case ChannelStreamMode.STREAM_MODE_CHANNEL:
						sendMessage({ t: text }, mentionData, attachmentDataUnique || [], reference, false, false);
						break;
					case ChannelStreamMode.STREAM_MODE_DM:
					case ChannelStreamMode.STREAM_MODE_GROUP:
						handleSendDM({ t: text }, mentionData, attachmentDataUnique || [], reference);
						break;
					default:
						break;
				}
				setAttachmentData([]);
				saveAttachmentToCache([]);
				removeAction(EMessageActionType.Reply);
			}
		}
		inputRef?.current?.clear?.();
		setText('');
		[EMessageActionType.CreateThread].includes(props.messageAction) &&
			DeviceEventEmitter.emit(ActionEmitEvent.SEND_MESSAGE, payloadThreadSendMessage);
		resetCachedText();
		resetCachedAttachment();
	}, [
		sendMessage,
		handleSendDM,
		props.mode,
		text,
		mentionData,
		currentSelectedReplyMessage,
		messageActionListNeedToResolve,
		currentSelectedEditMessage,
		editMessage,
		removeAction,
		attachmentDataRef,
		inputRef,
	]);

	const handleTyping = useCallback(() => {
		sendMessageTyping();
	}, [sendMessageTyping]);

	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

	useEffect(() => {
		messageActionListNeedToResolve.forEach((item) => {
			const { targetMessage, type, replyTo } = item;
			switch (type) {
				case EMessageActionType.Reply:
					setCurrentSelectedReplyMessage(targetMessage);
					if (replyTo) {
						setReplyDisplayName(replyTo);
					}
					break;
				case EMessageActionType.EditMessage:
					setCurrentSelectedEditMessage(targetMessage);
					setText(targetMessage.content.t);
					break;
				default:
					setReplyDisplayName('');
					break;
			}
		});
	}, [messageActionListNeedToResolve]);

	const sortMessageActionList = (a: IMessageActionNeedToResolve, b: IMessageActionNeedToResolve) => {
		if (a.type === EMessageActionType.EditMessage && b.type !== EMessageActionType.EditMessage) {
			return 1;
		}
		if (a.type !== EMessageActionType.EditMessage && b.type === EMessageActionType.EditMessage) {
			return -1;
		}
		return 0;
	};

	const pushMessageActionIntoStack = useCallback(
		(messagePayload: IMessageActionNeedToResolve) => {
			const isExistingAction = messageActionListNeedToResolve.some((it) => it.type === messagePayload.type);
			if (isExistingAction) {
				const newStack = [...messageActionListNeedToResolve.filter((it) => it.type !== messagePayload.type), { ...messagePayload }].sort(
					sortMessageActionList,
				);
				setMessageActionListNeedToResolve(newStack);
			} else {
				setMessageActionListNeedToResolve((preValue) => [...preValue, { ...messagePayload }].sort(sortMessageActionList));
			}
		},
		[messageActionListNeedToResolve],
	);

	function keyboardWillShow(event: KeyboardEvent) {
		if (keyboardHeight !== event.endCoordinates.height) {
			setIsShowEmojiNativeIOS(event.endCoordinates.height >= 380 && Platform.OS === 'ios');
			setKeyboardHeight(event.endCoordinates.height <= 345 ? 345 : event.endCoordinates.height);
		}
	}
	useEffect(() => {
		const keyboardListener = Keyboard.addListener('keyboardDidShow', keyboardWillShow);
		const showKeyboard = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_KEYBOARD, (value) => {
			//NOTE: trigger from message action 'MessageItemBS and MessageItem component'
			const { isStillShowKeyboard } = value;
			if (!isStillShowKeyboard) {
				resetInput();
			}
			handleMessageAction(value);
			openKeyBoard();
		});
		return () => {
			showKeyboard.remove();
			resetInput();
			keyboardListener.remove();
		};
	}, []);

	useEffect(() => {
		const listChannelsMention: ChannelsMention[] = listChannels.map((item) => {
			return {
				id: item?.channel_id ?? '',
				display: item?.channel_label ?? '',
				subText: item?.category_name ?? '',
			};
		});
		setListChannelsMention(listChannelsMention);
	}, [listChannels]);

	const handleTextInputChange = async (text: string) => {
		const isConvertToFileTxt = text?.length > MIN_THRESHOLD_CHARS;
		if (isConvertToFileTxt) {
			setText('');
			currentTextInput.current = '';
			await onConvertToFiles(text);
		} else {
			setText(convertMentionsToText(text));
			setMentionTextValue(text);
		}
		setIsShowAttachControl(false);
		saveMessageToCache(text);
		switch (props.mode) {
			case ChannelStreamMode.STREAM_MODE_CHANNEL:
				handleTypingDebounced();
				break;
			case ChannelStreamMode.STREAM_MODE_DM:
			case ChannelStreamMode.STREAM_MODE_GROUP:
				handleDirectMessageTypingDebounced();
				break;
			default:
				break;
		}
	};

	const onConvertToFiles = useCallback(async (content: string) => {
		try {
			if (content?.length > MIN_THRESHOLD_CHARS) {
				const fileTxtSaved = await writeTextToFile(content);
				const session = sessionRef.current;
				const client = clientRef.current;

				if (!client || !session || !currentChannel.channel_id) {
					console.log('Client is not initialized');
				}
				handleUploadFileMobile(client, session, fileTxtSaved.name, fileTxtSaved)
					.then((attachment) => {
						handleFinishUpload(attachment);
						return 'handled';
					})
					.catch((err) => {
						console.log('err', err);
						return 'not-handled';
					});
			}
		} catch (e) {
			console.log('err', e);
		}
	}, []);

	const handleFinishUpload = useCallback((attachment: ApiMessageAttachment) => {
		typeConverts.map((typeConvert) => {
			if (typeConvert.type === attachment.filetype) {
				return (attachment.filetype = typeConvert.typeConvert);
			}
		});
		setAttachmentData(attachment);
	}, []);

	const writeTextToFile = async (text: string) => {
		// Define the path to the file
		const now = Date.now();
		const filename = now + '.txt';
		const path = RNFS.DocumentDirectoryPath + `/${filename}`;

		// Write the text to the file
		await RNFS.writeFile(path, text, 'utf8')
			.then((success) => {
				console.log('FILE WRITTEN!');
			})
			.catch((err) => {
				console.log(err.message);
			});

		// Read the file to get its base64 representation
		const fileData = await RNFS.readFile(path, 'base64');

		// Create the file object
		const fileFormat: IFile = {
			uri: path,
			name: filename,
			type: 'text/plain',
			size: (await RNFS.stat(path)).size.toString(),
			fileData: fileData,
		};

		return fileFormat;
	};

	const handleMentionInput = (mentions: MentionDataProps[]) => {
		const mentionedUsers: UserMentionsOpt[] = [];
		const mentionList =
			members?.map((item: ChannelMembersEntity) => ({
				id: item?.user?.id ?? '',
				display: item?.user?.username ?? '',
				avatarUrl: item?.user?.avatar_url ?? '',
			})) ?? [];
		const convertedMentions: UserMentionsOpt[] = mentionList
			? mentionList.map((mention) => ({
				user_id: mention.id.toString() ?? '',
				username: mention.display ?? '',
			}))
			: [];
		if (mentions?.length > 0) {
			if (mentions.some((mention) => mention.display === '@here')) {
				mentionedUsers.splice(0, mentionedUsers.length);
				convertedMentions.forEach((item) => {
					mentionedUsers.push(item);
				});
			} else {
				for (const mention of mentions) {
					if (mention.display.startsWith('@')) {
						mentionedUsers.push({
							user_id: mention.id.toString() ?? '',
							username: mention.display ?? '',
						});
					}
				}
			}
			setMentionData(mentionedUsers);
		}
	};

	useEffect(() => {
		const mentionsSelected = getListMentionSelected();
		handleMentionInput(mentionsSelected);
	}, [mentionTextValue]);

	const getListMentionSelected = () => {
		if (!mentionTextValue || !mentions?.current?.length) return;
		const mentionRegex = /(?<!\w)@[\w.]+(?!\w)/g;
		const validMentions = text?.match(mentionRegex);
		const mentionsSelected = mentions?.current?.filter((mention) => {
			return validMentions?.includes(`@${mention.display}` || '');
		});
		return mentionsSelected.map((mention) => ({
			id: mention.id,
			display: `@${mention.display}`,
		}));
	};

	const handleMessageAction = (messageAction: IMessageActionNeedToResolve) => {
		const { type, targetMessage } = messageAction;
		switch (type) {
			case EMessageActionType.EditMessage:
			case EMessageActionType.Reply:
				pushMessageActionIntoStack(messageAction);
				break;
			case EMessageActionType.CreateThread:
				setOpenThreadMessageState(true);
				setValueThread(targetMessage);
				timeoutRef.current = setTimeout(() => {
					navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL });
				}, 500);
				break;
			case EMessageActionType.Mention:
				selectMentionMessage(targetMessage);
				break;
			default:
				break;
		}
	};

	const openKeyBoard = () => {
		timeoutRef.current = setTimeout(() => {
			inputRef.current?.focus();
			setIsFocus(true);
		}, 300);
	};

	const handleInsertMentionTextInput = (mentionMessage) => {
		const cursorPosition = cursorPositionRef?.current;
		const inputValue = currentTextInput?.current;
		if (!mentionMessage?.display) return;
		const textMentions = `@${mentionMessage?.display} `;
		const textArray = inputValue?.split?.('');
		textArray.splice(cursorPosition, 0, textMentions);
		const textConverted = textArray.join('');
		setText(textConverted);
		setMentionTextValue(textConverted);
	};

	useEffect(() => {
		currentTextInput.current = text;
	}, [text]);

	const selectMentionMessage = (message: IMessageWithUser) => {
		const mention = mentions?.current?.find((mention) => {
			return mention.id === message.sender_id;
		});
		handleInsertMentionTextInput(mention);
	};

	const handleSelectionChange = (selection: { start: number; end: number }) => {
		cursorPositionRef.current = selection.start;
	};

	const resetInput = () => {
		setIsFocus(false);
		inputRef.current?.blur();
		if (timeoutRef) {
			clearTimeout(timeoutRef.current);
		}
	};

	function handleKeyboardBottomSheetMode(mode: IModeKeyboardPicker) {
		setModeKeyBoardBottomSheet(mode);
		if (mode === 'emoji' || mode === 'attachment') {
			props.onShowKeyboardBottomSheet(true, keyboardHeight, mode);
		} else {
			inputRef && inputRef.current && inputRef.current.focus();
			props.onShowKeyboardBottomSheet(false, 0);
		}
	}

	function handleInputFocus() {
		setModeKeyBoardBottomSheet('text');
		inputRef && inputRef.current && inputRef.current.focus();
		props.onShowKeyboardBottomSheet(false, keyboardHeight);
	}

	function handleInputBlur() {
		setIsShowAttachControl(false);
		if (modeKeyBoardBottomSheet === 'text') props.onShowKeyboardBottomSheet(false, 0);
	}

	function removeAttachmentByUrl(urlToRemove: string, fileName: string) {
		const removedAttachment = attachmentDataRef.filter((attachment) => {
			if (attachment.url === urlToRemove) {
				return false;
			}
			return !(fileName && attachment.filename === fileName);
		});

		setAttachmentData(removedAttachment);
		saveAttachmentToCache(removedAttachment);
	}

	return (
		<View style={[styles.wrapperChatBox, isShowEmojiNativeIOS && { paddingBottom: size.s_50 }]}>
			<View style={styles.aboveTextBoxWrapper}>
				{replyDisplayName ? (
					<View style={styles.aboveTextBoxItem}>
						<Pressable onPress={() => removeAction(EMessageActionType.Reply)}>
							<Icons.CircleXIcon height={20} width={20} color={themeValue.text} />
						</Pressable>
						<Text style={styles.aboveTextBoxText}>
							{t('chatBox.replyingTo')} {replyDisplayName}
						</Text>
					</View>
				) : null}
				{currentSelectedEditMessage ? (
					<View style={styles.aboveTextBoxItem}>
						<Pressable onPress={() => removeAction(EMessageActionType.EditMessage)}>
							<Icons.CircleXIcon height={20} width={20} color={themeValue.text} />
						</Pressable>
						<Text style={styles.aboveTextBoxText}>{t('chatBox.editingMessage')}</Text>
					</View>
				) : null}
			</View>
			<Suggestions suggestions={listMentions} {...triggers.mention} />
			<HashtagSuggestions listChannelsMention={listChannelsMention} {...triggers.hashtag} />
			<EmojiSuggestion {...triggers.emoji} />
			{!!attachmentDataRef?.length && (
				<AttachmentPreview attachments={getAttachmentUnique(attachmentDataRef)} onRemove={removeAttachmentByUrl} />
			)}
			<View style={styles.containerInput}>
				{text?.length > 0 && !isShowAttachControl ? (
					<TouchableOpacity style={[styles.btnIcon]} onPress={() => setIsShowAttachControl(!isShowAttachControl)}>
						<Icons.ChevronSmallLeftIcon width={22} height={22} color={themeValue.textStrong} />
					</TouchableOpacity>
				) : (
					<>
						<View style={styles.btnIcon}>
							<AttachmentSwitcher onChange={handleKeyboardBottomSheetMode} mode={modeKeyBoardBottomSheet} />
						</View>
						{!props?.hiddenIcon?.threadIcon && !!currentChannel?.channel_label && !Number(currentChannel?.parrent_id) && (
							<TouchableOpacity
								style={[styles.btnIcon]}
								onPress={() => navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD })}
							>
								<Icons.ThreadPlusIcon width={22} height={22} color={themeValue.textStrong} />
							</TouchableOpacity>
						)}
					</>
				)}

				<View style={styles.wrapperInput}>
					<TextInput
						ref={inputRef}
						autoFocus={isFocus}
						placeholder={'Write message here...'}
						placeholderTextColor={themeValue.text}
						blurOnSubmit={false}
						onSubmitEditing={handleSendMessage}
						onFocus={handleInputFocus}
						onBlur={handleInputBlur}
						multiline={true}
						spellCheck={false}
						numberOfLines={3}
						{...textInputProps}
						style={[
							styles.inputStyle,
							text?.length > 0 && { width: isShowAttachControl ? inputWidthWhenHasInput - size.s_40 : inputWidthWhenHasInput },
							{ height: Math.max(size.s_40, heightInput) },
						]}
						children={renderTextContent(text, emojiListPNG, channelsEntities)}
						onContentSizeChange={(e) => {
							if (e.nativeEvent.contentSize.height < size.s_40 * 2) setHeightInput(e.nativeEvent.contentSize.height);
						}}
					/>
					<View style={styles.iconEmoji}>
						<EmojiSwitcher onChange={handleKeyboardBottomSheetMode} mode={modeKeyBoardBottomSheet} />
					</View>
				</View>

				<View>
					{text?.length > 0 || !!attachmentDataRef?.length ? (
						<View onTouchEnd={handleSendMessage} style={[styles.btnIcon, styles.iconSend]}>
							<Icons.SendMessageIcon width={18} height={18} color={baseColor.white} />
						</View>
					) : (
						<TouchableOpacity onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })} style={styles.btnIcon}>
							<Icons.MicrophoneIcon width={22} height={22} color={themeValue.textStrong} />
						</TouchableOpacity>
					)}
				</View>
			</View>
		</View>
	);
});

export default ChatBox;
