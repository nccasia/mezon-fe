import { IParsedMessage } from "./useMessageParser";
import MessageImage from "./MessageImage";
import MessageLinkFile from "./MessageLinkFile";
import MessageLine from "./MesageLine";
import { IMessageSender } from "./useMessageSender";

type IMessageContentProps = {
    sender: IMessageSender;
    parsedMessage: IParsedMessage
}

const MessageContent = ({ sender, parsedMessage }: IMessageContentProps) => {
    const { attachments, lines } = parsedMessage;

    // TODO: move logic to useMessageParser
    if (attachments && attachments.length > 0 && attachments[0].filetype?.indexOf('image') !== -1) {
        // TODO: render multiple attachments
        return <MessageImage attachmentData={attachments[0]} />;
    }

    // TODO: move logic to useMessageParser
    if (attachments && attachments.length > 0 && attachments[0].filetype?.indexOf('image') === -1) {
        return <MessageLinkFile attachmentData={attachments[0]} />;
    }
    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {lines?.map((line: string, index: number) =>
                <MessageLine line={line} key={index} />
            )}
        </>
    );
}

export default MessageContent;
