import { IChannelMember, IMessageWithUser } from '@mezon/utils';
import MessageLine from './MessageLine';
import { useMessageParser } from './useMessageParser';

type IMessageContentProps = {
	user?: IChannelMember | null;
	message: IMessageWithUser;
	isCombine?: boolean;
	newMessage?: string;
	isSending?: boolean;
	isError?: boolean;
};

const MessageText = ({ message, lines, isEdited }: { message: IMessageWithUser; lines: string; isEdited?: boolean }) => (
	<div className="flex w-full">
		<div id={message.id} className="w-full">
			<MessageLine line={lines} messageId={message.id} />
		</div>
		{isEdited && (
			<p className="ml-[5px] opacity-50 text-[9px] self-center font-semibold dark:text-textDarkTheme text-textLightTheme w-[50px]">(edited)</p>
		)}
	</div>
);

const MessageContent = ({ message }: IMessageContentProps) => {
	const { lines, isEdited } = useMessageParser(message);

	return (
		<MessageText message={message} lines={lines as string} isEdited={isEdited} />
	);
};

export default MessageContent;
