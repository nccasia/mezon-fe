import { IExtendedMessage, IMessageWithUser, isValidEmojiData } from '@mezon/utils';
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
	content?: IExtendedMessage;
	isSearchMessage?: boolean;
};

const MessageContent = ({ message, mode, isSearchMessage }: IMessageContentProps) => {
	const { lines, isEdited, contentUpdatedMention } = useMessageParser(message);

	const isOnlyContainEmoji = useMemo(() => {
		return isValidEmojiData(contentUpdatedMention);
	}, [contentUpdatedMention, message.content, message.mentions]);

	const lineValue = useMemo(() => {
		if (lines === undefined && typeof message.content === 'string') {
			return JSON.parse(message.content).t;
		} else {
			return lines;
		}
	}, [lines, message.content]);
	return (
		<MessageText
			isOnlyContainEmoji={isOnlyContainEmoji}
			isSearchMessage={isSearchMessage}
			content={contentUpdatedMention}
			message={message}
			lines={lineValue as string}
			isEdited={isEdited}
			mode={mode}
		/>
	);
};

export default MessageContent;

const MessageText = ({
	message,
	lines,
	isEdited,
	mode,
	content,
	isOnlyContainEmoji,
	isSearchMessage,
}: {
	message: IMessageWithUser;
	lines: string;
	isEdited?: boolean;
	mode?: number;
	content?: IExtendedMessage;
	isSearchMessage?: boolean;
	isOnlyContainEmoji?: boolean;
}) => (
	<>
		{' '}
		{lines?.length > 0 ? (
			<div className="flex w-full">
				<div className="w-full">
					<MessageLine
						isTokenClickAble={true}
						isSearchMessage={isSearchMessage}
						isOnlyContainEmoji={isOnlyContainEmoji}
						isJumMessageEnabled={false}
						isSingleLine={false}
						content={content}
						mode={mode}
					/>
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
