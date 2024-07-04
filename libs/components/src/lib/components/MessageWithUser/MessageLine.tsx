import MarkdownFormatText from '../MarkdownFormatText';
import MessageImage from './MessageImage';
import { useMessageLine } from './useMessageLine';

type MessageLineProps = {
	line: string;
	messageId?: string;
	mode?: number;
};

// TODO: refactor component for message lines
const MessageLine = ({ line, messageId, mode }: MessageLineProps) => {
	const { mentions, isOnlyEmoji, imageLinks } = useMessageLine(line);

	return (
		<div className="pt-[0.2rem] pl-0">
			<MarkdownFormatText mentions={mentions} isOnlyEmoji={isOnlyEmoji} mode={mode}/>
			{imageLinks.length > 0 &&
				imageLinks?.map((item, index) => {
					return <MessageImage key={index}  attachmentData={{ url: item.matchedText }} />;
				})}
		</div>
	);
};

export default MessageLine;
