import { MessageBox, IMessagePayload } from '@mezon/components';
import { useChatChannel, useChatDirect } from '@mezon/core';
import { RootState } from '@mezon/store';
import { IMessage } from '@mezon/utils';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce'

type ChannelMessageBoxProps = {
    channelId: string;
}

export function ChannelMessageBox({ channelId }: ChannelMessageBoxProps) {
    const { sendMessage, sendMessageTyping } = useChatChannel(channelId);
    
    const handleSend = useCallback(
        (mess: IMessagePayload) => {
            const messageToSend: IMessage = {
                ...mess,
            };
            sendMessage(messageToSend);
        },
        [sendMessage],
    );

    const handleTyping = useCallback(
        () => {
            sendMessageTyping();
        },
        [sendMessageTyping],
    );

    const handleTypingDebounced = useDebouncedCallback(handleTyping, 1000);

    return (
        <div>
            <MessageBox onSend={handleSend} onTyping={handleTypingDebounced} />
        </div>
    );
}

ChannelMessageBox.Skeleton = () => {
    return (
        <div>
            <MessageBox.Skeleton />
        </div>
    );
}

