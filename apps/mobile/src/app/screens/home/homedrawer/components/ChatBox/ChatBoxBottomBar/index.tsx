import { useEmojiSuggestion, useReference, useThreads } from '@mezon/core';
import {
  STORAGE_KEY_TEMPORARY_INPUT_MESSAGES,
  convertMentionsToText,
  convertToPlainTextHashtag,
  getAttachmentUnique,
  load,
  save
} from '@mezon/mobile-components';
import { Block, Colors, size } from '@mezon/mobile-ui';
import { selectChannelsEntities, selectCurrentChannel } from '@mezon/store-mobile';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import {
  IEmojiOnMessage,
  IHashtagOnMessage,
  ILinkOnMessage,
  IMentionOnMessage,
  ImarkdownOnMessage,
  MIN_THRESHOLD_CHARS,
  MentionDataProps,
  convertMarkdown,
  markdownRegex,
  typeConverts,
} from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, TextInput } from 'react-native';
import { TriggersConfig, useMentions } from 'react-native-controlled-mentions';
import RNFS from 'react-native-fs';
import { useSelector } from 'react-redux';
import { EmojiSuggestion, HashtagSuggestions, Suggestions } from '../../../../../../components/Suggestions';
import UseMentionList from '../../../../../../hooks/useUserMentionList';
import { APP_SCREEN } from '../../../../../../navigation/ScreenTypes';
import { EMessageActionType } from '../../../enums';
import { IMessageActionNeedToResolve } from '../../../types';
import { IFile } from '../../AttachmentPicker/Gallery';
import AttachmentPreview from '../../AttachmentPreview';
import { IModeKeyboardPicker } from '../../BottomKeyboardPicker';
import { ChatMessageInput } from '../ChatMessageInput';
import { ChatMessageLeftArea } from '../ChatMessageLeftArea';

const emojiRegex = /:[a-zA-Z0-9_]+:/g;
const linkRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
const mentionRegex = /(?<!\w)@[\w.]+(?!\w)/g;
const channelRegex = /<#[0-9]{19}\b>/g;

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

interface IChatInputProps {
  mode: ChannelStreamMode;
  channelId: string;
  hiddenIcon?: {
    threadIcon?: boolean;
  };
  messageActionNeedToResolve: IMessageActionNeedToResolve | null;
  messageAction?: EMessageActionType;
  onDeleteMessageActionNeedToResolve?: () => void;
  onShowKeyboardBottomSheet?: (isShow: boolean, height: number, type?: string) => void;
}

export const ChatBoxBottomBar = memo(
  ({
    mode = 2,
    channelId = '',
    hiddenIcon,
    messageActionNeedToResolve,
    messageAction,
    onDeleteMessageActionNeedToResolve,
    onShowKeyboardBottomSheet
  }: IChatInputProps) => {
    const [text, setText] = useState<string>('');
    const [mentionTextValue, setMentionTextValue] = useState('');
    const [isShowAttachControl, setIsShowAttachControl] = useState<boolean>(false);
    const [isFocus, setIsFocus] = useState<boolean>(false);
    const [modeKeyBoardBottomSheet, setModeKeyBoardBottomSheet] = useState<IModeKeyboardPicker>('text');
    const { attachmentDataRef, setAttachmentData } = useReference();
    const currentChannel = useSelector(selectCurrentChannel);
    const channelsEntities = useSelector(selectChannelsEntities);
    const navigation = useNavigation<any>();
    const inputRef = useRef<TextInput>();
    const cursorPositionRef = useRef(0);
    const currentTextInput = useRef('');
    const { emojiPicked } = useEmojiSuggestion();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(Platform.OS === 'ios' ? 345 : 274);
    const [isShowEmojiNativeIOS, setIsShowEmojiNativeIOS] = useState<boolean>(false);
    const { setOpenThreadMessageState } = useReference();
    const { setValueThread } = useThreads();
    const { sessionRef, clientRef } = useMezon();
    const listMentions = UseMentionList(channelId || '');
    const { textInputProps, triggers } = useMentions({
      value: mentionTextValue,
      onChange: (newValue) => handleTextInputChange(newValue),
      onSelectionChange: (position) => {
        handleSelectionChange(position);
      },
      triggersConfig,
    });

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [mentionsOnMessage, setMentionsOnMessage] = useState<IMentionOnMessage[]>([]);
    const [hashtagsOnMessage, setHashtagsOnMessage] = useState<IHashtagOnMessage[]>([]);
    const [emojisOnMessage, setEmojisOnMessage] = useState<IEmojiOnMessage[]>([]);
    const [linksOnMessage, setLinksOnMessage] = useState<ILinkOnMessage[]>([]);
    const [markdownsOnMessage, setMarkdownsOnMessage] = useState<ImarkdownOnMessage[]>([]);
    const [plainTextMessage, setPlainTextMessage] = useState<string>();

    const mentionList: IMentionOnMessage[] = [];
    const hashtagList: IHashtagOnMessage[] = [];
    const emojiList: IEmojiOnMessage[] = [];
    const linkList: ILinkOnMessage[] = [];
    const markdownList: ImarkdownOnMessage[] = [];
    
    const isShowCreateThread = useMemo(() => {
      return !hiddenIcon?.threadIcon && !!currentChannel?.channel_label && !Number(currentChannel?.parrent_id);
    }, [currentChannel?.channel_label, currentChannel?.parrent_id, hiddenIcon?.threadIcon])

    const saveMessageToCache = (text: string) => {
      const allCachedMessage = load(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES);
      save(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES, {
        ...allCachedMessage,
        [channelId]: text,
      });
    };

    const setMessageFromCache = async () => {
      const allCachedMessage = load(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES);
      handleTextInputChange(allCachedMessage?.[channelId] || '');
      setText(convertMentionsToText(allCachedMessage?.[channelId] || ''));
    };

    const resetCachedText = useCallback(async () => {
      const allCachedMessage = load(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES);
      delete allCachedMessage[channelId];
      save(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES, {
        ...allCachedMessage,
      });
    }, [channelId]);

    useEffect(() => {
      if (channelId) {
        setMessageFromCache();
      }
    }, [channelId]);

    useEffect(() => {
      if (emojiPicked) {
        handleEventAfterEmojiPicked();
      }
    }, [emojiPicked]);

    const handleEventAfterEmojiPicked = async () => {
      const textFormat = `${text?.endsWith(' ') ? text : text + ' '}${emojiPicked?.toString()} `;
      await handleTextInputChange(textFormat);
    };

    const removeAttachmentByUrl = (urlToRemove: string, fileName: string) => {
      const removedAttachment = attachmentDataRef.filter((attachment) => {
        if (attachment.url === urlToRemove) {
          return false;
        }
        return !(fileName && attachment.filename === fileName);
      });

      setAttachmentData(removedAttachment);
    };

    const onSendSuccess = useCallback(() => {
      setText('');
      setMentionsOnMessage([]);
      setHashtagsOnMessage([]);
      setEmojisOnMessage([]);
      setLinksOnMessage([]);
      setMarkdownsOnMessage([]);
      onDeleteMessageActionNeedToResolve();
      resetCachedText();
    }, [resetCachedText]);

    const handleKeyboardBottomSheetMode = useCallback(
      (mode: IModeKeyboardPicker) => {
        setModeKeyBoardBottomSheet(mode);
        if (mode === 'emoji' || mode === 'attachment') {
          onShowKeyboardBottomSheet(true, keyboardHeight, mode);
        } else {
          inputRef && inputRef.current && inputRef.current.focus();
          onShowKeyboardBottomSheet(false, 0);
        }
      },
      [keyboardHeight, onShowKeyboardBottomSheet],
    );

    const getChannelById = (channelId: string) => {
      const channel = channelsEntities?.[channelId];
      if (channel) {
        return channel;
      } else {
        return null;
      }
    };

    const handleTextInputChange = async (text: string) => {
      const isConvertToFileTxt = text?.length > MIN_THRESHOLD_CHARS;
      if (isConvertToFileTxt) {
        setText('');
        currentTextInput.current = '';
        await onConvertToFiles(text);
      } else {
        const convertedHashtag = convertMentionsToText(text);

        let match;
        while ((match = emojiRegex.exec(convertedHashtag)) !== null) {
          emojiList.push({
            shortname: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          });
        }
        setEmojisOnMessage(emojiList);

        while ((match = linkRegex.exec(convertedHashtag)) !== null) {
          linkList.push({
            link: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          });
        }
        setLinksOnMessage(linkList);

        while ((match = markdownRegex.exec(convertedHashtag)) !== null) {
          const startsWithTripleBackticks = match[0].startsWith('```');
          const endsWithNoTripleBackticks = match[0].endsWith('```');
          const convertedMarkdown = startsWithTripleBackticks && endsWithNoTripleBackticks ? convertMarkdown(match[0]) : match[0];
          markdownList.push({
            markdown: convertedMarkdown,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          });
        }
        while ((match = mentionRegex.exec(convertedHashtag)) !== null) {
          const mention = listMentions.find((m) => `@${m.display}` === match?.[0]);
          if (mention) {
            mentionList.push({
              userId: mention?.id?.toString() ?? '',
              username: `@${mention?.display}`,
              startIndex: match.index,
              endIndex: match.index + match[0].length,
            });
          }
        }

        while ((match = channelRegex.exec(convertedHashtag)) !== null) {
          const matchChannelId = match[0].match(/<#(\d+)>/);
          const channelId = matchChannelId ? matchChannelId?.[1] : null;
          const channelInfo = getChannelById(channelId);
          if (channelInfo) {
            hashtagList.push({
              channelId: channelInfo.id.toString() ?? '',
              channelLable: channelInfo.channel_label ?? '',
              startIndex: match.index,
              endIndex: match.index + match[0].length,
            });
          }
        }

        setMarkdownsOnMessage(markdownList);
        setHashtagsOnMessage(hashtagList);
        setMentionsOnMessage(mentionList);
        setMentionTextValue(text);
        setText(convertedHashtag);
        setPlainTextMessage(convertToPlainTextHashtag(text));
      }
      setIsShowAttachControl(false);
      saveMessageToCache(text);
    };

    const handleSelectionChange = (selection: { start: number; end: number }) => {
      cursorPositionRef.current = selection.start;
    };

    function keyboardWillShow(event) {
      if (keyboardHeight !== event.endCoordinates.height) {
        setIsShowEmojiNativeIOS(event.endCoordinates.height >= 380 && Platform.OS === 'ios');
        setKeyboardHeight(event.endCoordinates.height <= 345 ? 345 : event.endCoordinates.height);
      }
    }

    const handleMessageAction = (messageAction: IMessageActionNeedToResolve) => {
      const { type, targetMessage } = messageAction;
      switch (type) {
        case EMessageActionType.Reply:
          setText('');
          break;
        case EMessageActionType.EditMessage:
          handleTextInputChange(targetMessage.content.t);
          // setText(targetMessage.content.t);
          break;
        case EMessageActionType.CreateThread:
          setOpenThreadMessageState(true);
          setValueThread(targetMessage);
          timeoutRef.current = setTimeout(() => {
            navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL });
          }, 500);
          break;
        default:
          break;
      }
    };

    const handleInsertMentionTextInput = async (mentionMessage) => {
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

    const onAddMentionMessageAction = useCallback(
      async (data: MentionDataProps[]) => {
        const mention = data?.find((mention) => {
          return mention.id === messageActionNeedToResolve?.targetMessage?.sender_id;
        });
        await handleInsertMentionTextInput(mention);
        onDeleteMessageActionNeedToResolve();
        openKeyBoard();
      },
      [messageActionNeedToResolve?.targetMessage?.sender_id, onDeleteMessageActionNeedToResolve],
    );

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

    const resetInput = () => {
      setIsFocus(false);
      inputRef.current?.blur();
      if (timeoutRef) {
        clearTimeout(timeoutRef.current);
      }
    };

    const openKeyBoard = () => {
      timeoutRef.current = setTimeout(() => {
        inputRef.current?.focus();
        setIsFocus(true);
      }, 300);
    };

    useEffect(() => {
      if (messageActionNeedToResolve !== null) {
        const { isStillShowKeyboard } = messageActionNeedToResolve;
        if (!isStillShowKeyboard) {
          resetInput();
        }
        handleMessageAction(messageActionNeedToResolve);
        openKeyBoard();
      }
    }, [messageActionNeedToResolve]);

    useEffect(() => {
      const keyboardListener = Keyboard.addListener('keyboardDidShow', keyboardWillShow);
      return () => {
        keyboardListener.remove();
      };
    }, []);

    return (
      <Block paddingHorizontal={size.s_6} style={[isShowEmojiNativeIOS && { paddingBottom: size.s_50 }]}>
        <Suggestions
          channelId={channelId}
          {...triggers.mention}
          messageActionNeedToResolve={messageActionNeedToResolve}
          onAddMentionMessageAction={onAddMentionMessageAction}
          mentionTextValue={mentionTextValue}
        />
        <HashtagSuggestions {...triggers.hashtag} />
        <EmojiSuggestion {...triggers.emoji} />

        {!!attachmentDataRef?.length && (
          <AttachmentPreview attachments={getAttachmentUnique(attachmentDataRef)} onRemove={removeAttachmentByUrl} />
        )}

        <Block flexDirection="row" justifyContent="space-between" alignItems="center" paddingVertical={size.s_10}>
          <ChatMessageLeftArea
            isShowAttachControl={isShowAttachControl}
            setIsShowAttachControl={setIsShowAttachControl}
            text={text}
            isShowCreateThread={isShowCreateThread}
            modeKeyBoardBottomSheet={modeKeyBoardBottomSheet}
            handleKeyboardBottomSheetMode={handleKeyboardBottomSheetMode}
          />

          <ChatMessageInput
            channelId={channelId}
            mode={mode}
            isFocus={isFocus}
            isShowAttachControl={isShowAttachControl}
            text={text}
            textInputProps={textInputProps}
            ref={inputRef}
            messageAction={messageAction}
            messageActionNeedToResolve={messageActionNeedToResolve}
            modeKeyBoardBottomSheet={modeKeyBoardBottomSheet}
            onSendSuccess={onSendSuccess}
            handleKeyboardBottomSheetMode={handleKeyboardBottomSheetMode}
            setIsShowAttachControl={setIsShowAttachControl}
            onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
            setModeKeyBoardBottomSheet={setModeKeyBoardBottomSheet}
            keyboardHeight={keyboardHeight}
            mentionsOnMessage={mentionsOnMessage}
            hashtagsOnMessage={hashtagsOnMessage}
            emojisOnMessage={emojisOnMessage}
            linksOnMessage={linksOnMessage}
            markdownsOnMessage={markdownsOnMessage}
            plainTextMessage={plainTextMessage}
            isShowCreateThread={isShowCreateThread}
          />
        </Block>
      </Block>
    );
  },
);
