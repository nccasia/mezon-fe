import { MessageBox, IMessagePayload } from "@mezon/components";
import { useChat } from "@mezon/core";
import { RootState } from "@mezon/store";
import { IMessage } from "@mezon/utils";
import { useCallback } from "react";
import { useSelector } from "react-redux";

interface typeChatProps {
  typeChatDirectMessage: boolean;
}
export function ChannelMessageBox({ typeChatDirectMessage }: typeChatProps) {
  const { sendMessage, sendDirectMessage } = useChat();
  const sessionUser = useSelector((state: RootState) => state.auth.session);
  const handleSend = useCallback(
    (mess: IMessagePayload) => {
      console.log("message-payload", mess)
      if (sessionUser) {
        const messageToSend: IMessage = {
          ...mess,
        };
        if (typeChatDirectMessage) {
          sendDirectMessage(messageToSend);
        } else {
          sendMessage(messageToSend);
        }
      } else {
        console.error("Session is not available");
      }
    },
    [sendMessage, sendDirectMessage, sessionUser],
  );

  return (
    <div>
      <MessageBox onSend={handleSend} />
    </div>
  );
}
