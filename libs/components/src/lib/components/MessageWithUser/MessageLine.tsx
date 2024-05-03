import MarkdownFormatText from '../MarkdownFormatText';
import { useMessageLine } from './useMessageLine';

type MessageLineProps = {
	line: string;
};

const LineWithLink = ({ link }: { link: string }) => {
	return (
		<a href={link} className="text-blue-500 hover:underline" rel="noopener noreferrer" target="_blank">
			{link}
		</a>
	);
};

const isLink = (line: string) => {
	if (line?.includes(' ')) {
		return false;
	}
	if ((line?.startsWith('http://')) || (line?.startsWith('https://'))) {
		return true;
	}
	return false;
};

const MessageLine = ({ line }: MessageLineProps) => {
	const { mentions } = useMessageLine(line);
	return (
		<>
			{isLink(line) ? (
				<LineWithLink link={line} />
			) : (
				<div>
					<MarkdownFormatText mentions={mentions} />
				</div>
			)}
		</>
	);
};

export default MessageLine;
