import { ETypeLinkMedia, IExtendedMessage, IMessageWithUser, isValidEmojiData } from '@mezon/utils';
import { useMemo } from 'react';
import { MessageLine } from './MessageLine';
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
	const { lines, contentUpdatedMention } = useMessageParser(message);

	const isOnlyContainEmoji = useMemo(() => {
		return isValidEmojiData(contentUpdatedMention);
	}, [contentUpdatedMention]);

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
			mode={mode}
		/>
	);
};

export default MessageContent;

const MessageText = ({
	message,
	lines,
	mode,
	content,
	isOnlyContainEmoji,
	isSearchMessage
}: {
	message: IMessageWithUser;
	lines: string;
	mode?: number;
	content?: IExtendedMessage;
	isSearchMessage?: boolean;
	isOnlyContainEmoji?: boolean;
}) => {
	const attachmentOnMessage = useMemo(() => {
		return message.attachments;
	}, [message.attachments]);

	const contentToMessage = useMemo(() => {
		return message.content?.t;
	}, [message]);

	const checkOneLinkImage = useMemo(() => {
		return (
			attachmentOnMessage?.length === 1 &&
			attachmentOnMessage[0].filetype?.startsWith(ETypeLinkMedia.IMAGE_PREFIX) &&
			attachmentOnMessage[0].url === contentToMessage?.trim()
		);
	}, [attachmentOnMessage, contentToMessage]);

	const showEditted = useMemo(() => {
		return message.hideEditted === false;
	}, [message.hideEditted]);

	return (
		<>
			{lines?.length > 0 ? (
				<div className="flex w-full">
					<div className="w-full">
						<MessageLine
							isEditted={showEditted}
							isHideLinkOneImage={checkOneLinkImage}
							isTokenClickAble={true}
							isSearchMessage={isSearchMessage}
							isOnlyContainEmoji={isOnlyContainEmoji}
							isJumMessageEnabled={false}
							content={content}
							mode={mode}
						/>
					</div>
				</div>
			) : null}
		</>
	);
};
