import { Block, size, useTheme } from '@mezon/mobile-ui';
import { messagesActions, selectChannelById, selectCurrentClanId } from '@mezon/store';
import { useAppDispatch } from '@mezon/store-mobile';
import { IEmojiOnMessage, IHashtagOnMessage, ILinkOnMessage, ILinkVoiceRoomOnMessage, IMarkdownOnMessage, IMentionOnMessage } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { Dispatch, MutableRefObject, SetStateAction, forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import { EMessageActionType } from '../../../enums';
import { IMessageActionNeedToResolve } from '../../../types';
import { IModeKeyboardPicker } from '../../BottomKeyboardPicker';
import EmojiSwitcher from '../../EmojiPicker/EmojiSwitcher';
import { renderTextContent } from '../../RenderTextContent';
import { style } from '../ChatBoxBottomBar/style';
import { ChatMessageSending } from '../ChatMessageSending';

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
	mentionsOnMessage?: MutableRefObject<IMentionOnMessage[]>;
	hashtagsOnMessage?: MutableRefObject<IHashtagOnMessage[]>;
	emojisOnMessage?: MutableRefObject<IEmojiOnMessage[]>;
	linksOnMessage?: MutableRefObject<ILinkOnMessage[]>;
	markdownsOnMessage?: MutableRefObject<IMarkdownOnMessage[]>;
	voiceLinkRoomOnMessage?: MutableRefObject<ILinkVoiceRoomOnMessage[]>;
	isShowCreateThread?: boolean;
	parentId?: string;
	isPublic?: boolean;
}

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
				mentionsOnMessage,
				hashtagsOnMessage,
				emojisOnMessage,
				linksOnMessage,
				markdownsOnMessage,
				voiceLinkRoomOnMessage,
				isShowCreateThread,
				parentId,
				isPublic
			}: IChatMessageInputProps,
			ref: MutableRefObject<TextInput>
		) => {
			const [heightInput, setHeightInput] = useState(size.s_40);
			const { themeValue } = useTheme();
			const { t } = useTranslation('message');
			const dispatch = useAppDispatch();
			const styles = style(themeValue);
			const currentClanId = useSelector(selectCurrentClanId);
			const parent = useSelector(selectChannelById(channelId || ''));
			const isAvailableSending = useMemo(() => {
				return text?.length > 0 && text?.trim()?.length > 0;
			}, [text]);
			const valueInputRef = useRef<string>('');

			useEffect(() => {
				valueInputRef.current = text;
			}, [text]);

			const clearInputAfterSendMessage = useCallback(() => {
				onSendSuccess();
				ref.current?.clear?.();
			}, [onSendSuccess, ref]);

			const handleTyping = useCallback(async () => {
				dispatch(
					messagesActions.sendTypingUser({
						clanId: currentClanId || '',
						parentId: parentId,
						channelId,
						mode,
						isPublic,
						isParentPublic: parent ? !parent.channel_private : false
					})
				);
			}, [channelId, currentClanId, dispatch, isPublic, mode, parent, parentId]);

			const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

			const handleDirectMessageTyping = useCallback(async () => {
				await Promise.all([
					dispatch(
						messagesActions.sendTypingUser({
							clanId: '0',
							parentId: parentId,
							channelId: channelId,
							mode: mode,
							isPublic: false,
							isParentPublic: parent ? !parent.channel_private : false
						})
					)
				]);
			}, [channelId, dispatch, mode]);

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

			const handleTypingMessage = useCallback(async () => {
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
			}, [handleDirectMessageTypingDebounced, handleTypingDebounced, mode]);

			return (
				<Block flex={1} flexDirection="row" paddingHorizontal={size.s_6}>
					<Block alignItems="center" flex={1} justifyContent="center">
						<TextInput
							ref={ref}
							autoFocus={isFocus}
							placeholder={t('messageInputPlaceHolder')}
							placeholderTextColor={themeValue.textDisabled}
							blurOnSubmit={false}
							onFocus={handleInputFocus}
							onBlur={handleInputBlur}
							multiline={true}
							spellCheck={false}
							numberOfLines={4}
							onChange={() => handleTypingMessage()}
							{...textInputProps}
							style={[styles.inputStyle, { height: Platform.OS === 'ios' ? 'auto' : Math.max(size.s_40, heightInput) }]}
							children={renderTextContent(text)}
							onContentSizeChange={(e) => {
								if (Platform.OS === 'android') {
									if (e.nativeEvent.contentSize.height < size.s_40 * 2) {
										setHeightInput(e.nativeEvent.contentSize.height);
									} else {
										setHeightInput(size.s_40 * 3);
									}
								}
							}}
						/>
						<View style={styles.iconEmoji}>
							<EmojiSwitcher onChange={handleKeyboardBottomSheetMode} mode={modeKeyBoardBottomSheet} />
						</View>
					</Block>

					<ChatMessageSending
						isAvailableSending={isAvailableSending}
						valueInputRef={valueInputRef}
						mode={mode}
						channelId={channelId}
						messageActionNeedToResolve={messageActionNeedToResolve}
						mentionsOnMessage={mentionsOnMessage}
						hashtagsOnMessage={hashtagsOnMessage}
						emojisOnMessage={emojisOnMessage}
						linksOnMessage={linksOnMessage}
						markdownsOnMessage={markdownsOnMessage}
						voiceLinkRoomOnMessage={voiceLinkRoomOnMessage}
						messageAction={messageAction}
						clearInputAfterSendMessage={clearInputAfterSendMessage}
					/>
				</Block>
			);
		}
	)
);
