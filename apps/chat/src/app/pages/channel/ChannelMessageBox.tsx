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

// ===========
// TODO: move to separate file
interface DirectIdProps {
    directParamId: string;
}
export function DirectMessageBox({ directParamId }: DirectIdProps) {
    const { sendDirectMessage } = useChatDirect(directParamId);
    // TODO: move selector to store
    const sessionUser = useSelector((state: RootState) => state.auth.session);
    const handleSend = useCallback(
        (mess: IMessagePayload) => {
            if (sessionUser) {
                const messageToSend: IMessage = {
                    ...mess,
                };
                sendDirectMessage(messageToSend);
            } else {
                console.error("Session is not available");
            }
        },
        [sendDirectMessage, sessionUser],
    );

    return (
        <div>
            <MessageBox onSend={handleSend} />
        </div>
    );
}
