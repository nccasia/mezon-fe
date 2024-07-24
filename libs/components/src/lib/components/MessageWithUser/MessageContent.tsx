import { IMessageWithUser } from '@mezon/utils';
import { useMemo } from 'react';
import MessageLine from './MessageLine';
import { useMessageParser } from './useMessageParser';

type IMessageContentProps = {
	message: IMessageWithUser;
	isCombine?: boolean;
	newMessage?: string;
	isSending?: boolean;
	isError?: boolean;
	mode?: number;
	content?: any;
};

const MessageText = ({
	message,
	lines,
	isEdited,
	mode,
	content,
}: {
	message: IMessageWithUser;
	lines: string;
	isEdited?: boolean;
	mode?: number;
	content?: any;
}) => (
	<>
		{' '}
		{lines?.length > 0 ? (
			<div className="flex w-full">
				<div className="w-full">
					<MessageLine content={content} line={lines} messageId={message.id} mode={mode} />
				</div>
				{isEdited && (
					<p className="ml-[5px] opacity-50 text-[9px] self-center font-semibold dark:text-textDarkTheme text-textLightTheme w-[50px]">
						(edited)
					</p>
				)}
			</div>
		) : null}
	</>
);

const MessageContent = ({ message, mode }: IMessageContentProps) => {
	const { lines, isEdited, content } = useMessageParser(message);
	const lineValue = useMemo(() => {
		if (lines === undefined && typeof message.content === 'string') {
			return JSON.parse(message.content).t;
		} else {
			return lines;
		}
	}, [lines, message.content]);
	return <MessageText content={content} message={message} lines={lineValue as string} isEdited={isEdited} mode={mode} />;
};

export default MessageContent;
