import { MessageBox, IMessagePayload } from "@mezon/components";
import { useChat } from "@mezon/core";
import { RootState } from "@mezon/store";
import { IMessage } from "@mezon/utils";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useChatDmGroup } from "@mezon/core";

interface typeChatProps {
    typeChatDirectMessage?: boolean;
    dmGroupParam?: string | undefined;
}

export function ChannelMessageBox({ typeChatDirectMessage, dmGroupParam }: typeChatProps) {
    const { sendMessage } = useChat();
    const { sendMessageDmGroup } = useChatDmGroup(dmGroupParam);
    const sessionUser = useSelector((state: RootState) => state.auth.session);
    const handleSend = useCallback(
        (mess: IMessagePayload) => {
            const messageToSend: IMessage = {
                ...mess,
            };
            if (sessionUser) {
                if (typeChatDirectMessage && dmGroupParam) {
                    sendMessage(messageToSend);
                } else {
                    sendMessage(messageToSend);
                }
            } else {
                console.error("Session is not available");
            }
        },
        [sendMessage, sessionUser, sendMessageDmGroup],
    );

    return (
        <div>
            <MessageBox onSend={handleSend} />
        </div>
    );
}
