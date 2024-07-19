import { checkLinkImageWork } from '@mezon/utils';
import { memo, useLayoutEffect, useState } from 'react';
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
	const { mentions, isOnlyEmoji, links } = useMessageLine(line);
	const [link, setLink] = useState<string | undefined>(undefined);

	useLayoutEffect(() => {
		if (
			(links?.length === 1 && links[0].nonMatchText === '') ||
			(links?.length === 1 && links[0].nonMatchText.startsWith('[') && links[0].nonMatchText.endsWith(']('))
		) {
			const check = links[0].matchedText.endsWith(')') ? links[0].matchedText.slice(0, -1) : links[0].matchedText;
			checkLinkImageWork(check).then((result) => {
				if (result) {
					setLink(check);
				} else {
					setLink(undefined);
				}
			});
		} else {
			setLink(undefined);
		}
	}, [links, checkLinkImageWork]);

	return (
		<div className="pt-[0.2rem] pl-0">
			{link === undefined && <MarkdownFormatText mentions={mentions} isOnlyEmoji={isOnlyEmoji} mode={mode} lengthLine={line.length} />}
			{links.length > 0 &&
				links?.map((item, index) => {
					const linkItem = item.matchedText.endsWith(')') ? item.matchedText.slice(0, -1) : item.matchedText;
					return <MessageImage key={index} attachmentData={{ url: linkItem }} />;
				})}
		</div>
	);
};

export default memo(MessageLine);
