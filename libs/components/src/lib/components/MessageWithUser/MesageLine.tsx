import { ILineMention, useMessageLine } from "./useMessageLine";

type MessageLineProps = {
    line: string;
};

const MentionSpan = ({ text }: { text: string }) => (
    <span className="text-blue-500">{text}</span>
);

type ILinePartWithMention = {
    mention: ILineMention;
}

const LineWithMention = ({ mention }: ILinePartWithMention) => {
    const { matchedText, nonMatchText } = mention
    return (
        <>
            {nonMatchText && <span>{nonMatchText}</span>}
            <MentionSpan text={matchedText} />
        </>
    )
}

// TODO: refactor component for message lines
const MessageLine = ({ line }: MessageLineProps) => {
    const { mentions } = useMessageLine(line);
    console.log("mentions", mentions);
    return (
        <div>{mentions.map((mention, i) => {
            return (
                <LineWithMention key={i} mention={mention} />
            );
        })}
        </div>
    )
};

export default MessageLine;
