import {
  ActionEmitEvent,
} from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { ChannelStreamMode } from 'mezon-js';
import React, { memo, useEffect, useState } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import { ActionMessageSelected } from './components/ChatBox/ActionMessageSelected';
import { ChatBoxBottomBar } from './components/ChatBox/ChatBoxBottomBar';
import { EMessageActionType } from './enums';
import { style } from './styles';
import { IMessageActionNeedToResolve } from './types';

interface IChatBoxProps {
  channelId: string;
  mode: ChannelStreamMode;
  messageAction?: EMessageActionType;
  hiddenIcon?: {
    threadIcon: boolean;
  };
  directMessageId?: string;
  clanId?: string;
}
export const ChatBox = memo((props: IChatBoxProps) => {
  const { themeValue } = useTheme();
  const styles = style(themeValue);
  const [messageActionNeedToResolve, setMessageActionNeedToResolve] = useState<IMessageActionNeedToResolve | null>(null);

  useEffect(() => {
    if (props?.channelId && messageActionNeedToResolve) {
      setMessageActionNeedToResolve(null);
    }
  }, [props?.channelId]);

  useEffect(() => {
    const showKeyboard = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_KEYBOARD, (value) => {
      //NOTE: trigger from message action 'MessageItemBS and MessageItem component'
      setMessageActionNeedToResolve(value);
    });
    return () => {
      showKeyboard.remove();
    };
  }, []);

  return (
    <View style={styles.wrapperChatBox}>
      <ActionMessageSelected
        messageActionNeedToResolve={messageActionNeedToResolve}
        onClose={() => setMessageActionNeedToResolve(null)}
      />
      <ChatBoxBottomBar
        messageActionNeedToResolve={messageActionNeedToResolve}
        onDeleteMessageActionNeedToResolve={() => setMessageActionNeedToResolve(null)}
        channelId={props?.channelId}
        clanId={props?.clanId}
        mode={props?.mode}
        messageAction={props?.messageAction}
      />
    </View>
  );
});
