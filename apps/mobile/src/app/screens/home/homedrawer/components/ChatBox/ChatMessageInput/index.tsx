import { useChatSending, useDirectMessages, useEmojiSuggestion } from '@mezon/core';
import { ActionEmitEvent, Icons, getAttachmentUnique } from '@mezon/mobile-components';
import { Block, baseColor, size, useTheme } from '@mezon/mobile-ui';
import { referencesActions, selectAttachmentData } from '@mezon/store';
import { useAppDispatch } from '@mezon/store-mobile';
import {
	IEmojiOnMessage,
	IHashtagOnMessage,
	ILinkOnMessage,
	ILinkVoiceRoomOnMessage,
	IMarkdownOnMessage,
	IMentionOnMessage,
	IMessageSendPayload,
} from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { Dispatch, MutableRefObject, SetStateAction, forwardRef, memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Dimensions, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import { EMessageActionType } from '../../../enums';
import { IMessageActionNeedToResolve, IPayloadThreadSendMessage } from '../../../types';
import { IModeKeyboardPicker } from '../../BottomKeyboardPicker';
import EmojiSwitcher from '../../EmojiPicker/EmojiSwitcher';
import { renderTextContent } from '../../RenderTextContent';
import { style } from '../ChatBoxBottomBar/style';

interface IChatMessageInputProps {
	textInputProps: any;
	text: string;
	isFocus: boolean;
	isShowAttachControl: boolean;
	mode: ChannelStreamMode;
	channelId: string;
	messageActionNeedToResolve: IMessageActionNeedToResolve | null;
	messageAction?: EMessageActionType;
	onSendSuccess?: () => void;
	modeKeyBoardBottomSheet: IModeKeyboardPicker;
	handleKeyboardBottomSheetMode: (mode: IModeKeyboardPicker) => void;
	setModeKeyBoardBottomSheet: Dispatch<SetStateAction<IModeKeyboardPicker>>;
	setIsShowAttachControl: Dispatch<SetStateAction<boolean>>;
	onShowKeyboardBottomSheet?: (isShow: boolean, height: number, type?: string) => void;
	keyboardHeight?: number;
	mentionsOnMessage?: IMentionOnMessage[];
	hashtagsOnMessage?: IHashtagOnMessage[];
	emojisOnMessage?: IEmojiOnMessage[];
	linksOnMessage?: ILinkOnMessage[];
	markdownsOnMessage?: IMarkdownOnMessage[];
	voiceLinkRoomOnMessage?: ILinkVoiceRoomOnMessage[];
	plainTextMessage?: string;
	isShowCreateThread?: boolean;
	channelsEntities?: any;
}
const inputWidthWhenHasInput = Dimensions.get('window').width * 0.72;

export const ChatMessageInput = memo(
	forwardRef(
		(
			{
				textInputProps,
				text,
				isFocus,
				isShowAttachControl,
				channelId,
				mode,
				messageActionNeedToResolve,
				messageAction,
				onSendSuccess,
				handleKeyboardBottomSheetMode,
				modeKeyBoardBottomSheet,
				setModeKeyBoardBottomSheet,
				setIsShowAttachControl,
				onShowKeyboardBottomSheet,
				keyboardHeight,
				mentionsOnMessage = [],
				hashtagsOnMessage = [],
				emojisOnMessage,
				linksOnMessage,
				markdownsOnMessage,
				voiceLinkRoomOnMessage,
				plainTextMessage,
				isShowCreateThread,
				channelsEntities,
			}: IChatMessageInputProps,
			ref: MutableRefObject<TextInput>,
		) => {
			const [heightInput, setHeightInput] = useState(size.s_40);
			const { themeValue } = useTheme();
			const dispatch = useAppDispatch();
			const styles = style(themeValue);
			const attachmentDataRef = useSelector(selectAttachmentData(channelId || ''));
			const { t } = useTranslation(['message']);
			const {
				sendMessage,
				sendMessageTyping: channelMessageTyping,
				editSendMessage,
			} = useChatSending({
				channelId,
				mode,
				directMessageId: channelId || '',
			});

			const clearInputAfterSendMessage = useCallback(() => {
				onSendSuccess();
				ref.current?.clear?.();
			}, [onSendSuccess, ref]);

			const handleTyping = useCallback(async () => {
				await channelMessageTyping();
			}, [channelMessageTyping]);

			const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);
			const { setEmojiSuggestion } = useEmojiSuggestion();

			//start: DM stuff
			const { sendDirectMessage, sendMessageTyping: directMessageTyping } = useDirectMessages({
				channelId,
				mode,
			});
			const handleSendDM = useCallback(
				async (
					content: IMessageSendPayload,
					mentions?: Array<ApiMessageMention>,
					attachments?: Array<ApiMessageAttachment>,
					references?: Array<ApiMessageRef>,
				) => {
					await sendDirectMessage(content, mentions, attachments, references);
				},
				[sendDirectMessage],
			);

			const handleDirectMessageTyping = useCallback(async () => {
				await directMessageTyping();
			}, [directMessageTyping]);

			const handleDirectMessageTypingDebounced = useThrottledCallback(handleDirectMessageTyping, 1000);
			//end: DM stuff

			const handleInputFocus = () => {
				setModeKeyBoardBottomSheet('text');
				ref && ref.current && ref.current?.focus();
				onShowKeyboardBottomSheet(false, keyboardHeight);
			};

			const handleInputBlur = () => {
				setIsShowAttachControl(false);
				if (modeKeyBoardBottomSheet === 'text') {
					onShowKeyboardBottomSheet(false, 0);
				}
			};

			const handleTypingMessage = async () => {
				switch (mode) {
					case ChannelStreamMode.STREAM_MODE_CHANNEL:
						await handleTypingDebounced();
						break;
					case ChannelStreamMode.STREAM_MODE_DM:
					case ChannelStreamMode.STREAM_MODE_GROUP:
						await handleDirectMessageTypingDebounced();
						break;
					default:
						break;
				}
			};

			const onEditMessage = useCallback(
				async (editMessage: IMessageSendPayload, messageId: string) => {
					await editSendMessage(editMessage, messageId);
				},
				[editSendMessage],
			);

			const isCanSendMessage = useMemo(() => {
				return !!attachmentDataRef?.length || text?.length > 0;
			}, [attachmentDataRef?.length, text?.length]);

			const handleSendMessage = async () => {
				if (!isCanSendMessage) {
					return;
				}
				clearInputAfterSendMessage();

				const simplifiedMentionList = mentionsOnMessage?.map?.((mention) => ({
					user_id: mention.userid,
					username: mention.username,
				}));

				const payloadSendMessage: IMessageSendPayload = {
					t: text,
					mentions: mentionsOnMessage,
					hashtags: hashtagsOnMessage,
					emojis: emojisOnMessage,
					links: linksOnMessage,
					markdowns: markdownsOnMessage,
					plaintext: plainTextMessage,
					voicelinks: voiceLinkRoomOnMessage,
				};

				const payloadThreadSendMessage: IPayloadThreadSendMessage = {
					content: payloadSendMessage,
					mentions: simplifiedMentionList,
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
				dispatch(
					referencesActions.resetDataAttachment({
						channelId: channelId,
					}),
				);
				const { targetMessage, type } = messageActionNeedToResolve || {};
				const reference = targetMessage
					? [
							{
								message_id: '',
								message_ref_id: targetMessage.id,
								ref_type: 0,
								message_sender_id: targetMessage?.sender_id,
								message_sender_username: targetMessage?.username,
								mesages_sender_avatar: targetMessage?.avatar,
								message_sender_clan_nick: targetMessage?.clan_nick,
								message_sender_display_name: targetMessage?.display_name,
								content: JSON.stringify(targetMessage.content),
								has_attachment: Boolean(targetMessage?.attachments?.length),
							},
						]
					: undefined;

				setEmojiSuggestion('');

				const sendMessageAsync = async () => {
					if (type === EMessageActionType.EditMessage) {
						await onEditMessage(payloadSendMessage, messageActionNeedToResolve?.targetMessage?.id);
					} else {
						if (![EMessageActionType.CreateThread].includes(messageAction)) {
							const isMentionEveryOne = mentionsOnMessage.some((mention) => mention.username === '@here');
							switch (mode) {
								case ChannelStreamMode.STREAM_MODE_CHANNEL:
									await sendMessage(
										payloadSendMessage,
										simplifiedMentionList || [],
										attachmentDataUnique || [],
										reference,
										false,
										isMentionEveryOne,
									);
									break;
								case ChannelStreamMode.STREAM_MODE_DM:
								case ChannelStreamMode.STREAM_MODE_GROUP:
									await handleSendDM(payloadSendMessage, simplifiedMentionList, attachmentDataUnique || [], reference);
									break;
								default:
									break;
							}
						}
					}

					if ([EMessageActionType.CreateThread].includes(messageAction)) {
						DeviceEventEmitter.emit(ActionEmitEvent.SEND_MESSAGE, payloadThreadSendMessage);
					}
				};

				requestAnimationFrame(sendMessageAsync);
			};

			return (
				<Block flex={1} flexDirection="row" justifyContent="flex-end" gap={size.s_10}>
					<Block alignItems="center">
						<TextInput
							ref={ref}
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
							onChange={() => handleTypingMessage()}
							{...textInputProps}
							style={[
								styles.inputStyle,
								(text?.length > 0 || !isShowCreateThread) && {
									width: isShowAttachControl && isShowCreateThread ? inputWidthWhenHasInput - size.s_50 : inputWidthWhenHasInput,
								},
								{ height: Math.max(size.s_40, heightInput) },
							]}
							children={renderTextContent(text, channelsEntities)}
							onContentSizeChange={(e) => {
								if (e.nativeEvent.contentSize.height < size.s_40 * 2) setHeightInput(e.nativeEvent.contentSize.height);
							}}
						/>
						<View style={styles.iconEmoji}>
							<EmojiSwitcher onChange={handleKeyboardBottomSheetMode} mode={modeKeyBoardBottomSheet} />
						</View>
					</Block>

					<Block>
						{text?.length > 0 || !!attachmentDataRef?.length ? (
							<View onTouchEnd={handleSendMessage} style={[styles.btnIcon, styles.iconSend]}>
								<Icons.SendMessageIcon width={18} height={18} color={baseColor.white} />
							</View>
						) : (
							<TouchableOpacity onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })} style={styles.btnIcon}>
								<Icons.MicrophoneIcon width={22} height={22} color={themeValue.textStrong} />
							</TouchableOpacity>
						)}
					</Block>
				</Block>
			);
		},
	),
);
