import MarkdownFormatText from '../MarkdownFormatText';
import { ILineMention, useMessageLine } from './useMessageLine';

type MessageLineProps = {
    line: string;
};

const MentionSpan = ({ text }: { text: string }) => <span className="text-blue-500 cursor-pointer">{text}</span>;

type ILinePartWithMention = {
    mention: ILineMention;
};

const LineWithMention = ({ mention }: ILinePartWithMention) => {
    const { matchedText, nonMatchText } = mention;
    return (
        <>
            {nonMatchText && <MarkdownFormatText markdown={nonMatchText} />}
            <MentionSpan text={matchedText} />
        </>
    );
};

const LineWithLink = ({ link }: { link: string }) => {
    return (
        <a href={link} className="text-blue-500">
            {link}
        </a>
    );
};

const isLink = (line: string) => {
    if (line.includes(' ')) {
        return false;
    }
    if (line.startsWith('http://') || line.startsWith('https://')) {
        return true;
    }
    return false;
};

// TODO: refactor component for message lines
const MessageLine = ({ line }: MessageLineProps) => {
    const { mentions } = useMessageLine(line);
    if (isLink(line)) {
        return <LineWithLink link={line} />;
    }
    return (
        <div> 
            {mentions.map((mention, i) => {
                return <LineWithMention key={i} mention={mention} />;
            })}
        </div>
    );
};

export default MessageLine;
