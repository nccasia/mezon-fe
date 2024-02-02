import { useChatDirect } from "@mezon/core";
import { RootState } from "@mezon/store";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import MessageBox, { IMessagePayload } from "../MessageBox";
import { IMessage } from "@mezon/utils";

interface DirectIdProps {
    directParamId: string;
}
function DirectMessageBox({ directParamId }: DirectIdProps) {
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

export default DirectMessageBox;
