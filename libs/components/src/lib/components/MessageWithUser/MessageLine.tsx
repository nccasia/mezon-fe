import MarkdownFormatText from '../MarkdownFormatText';
import { useMessageLine } from './useMessageLine';

type MessageLineProps = {
	line: string;
};

// TODO: refactor component for message lines
const MessageLine = ({ line }: MessageLineProps) => {
	const { mentions } = useMessageLine(line);

	return (
		<div>
			<MarkdownFormatText mentions={mentions} />
		</div>
			
	);
};

export default MessageLine;
