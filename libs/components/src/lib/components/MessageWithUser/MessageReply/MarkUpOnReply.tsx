import { memo } from 'react';
import HashTagMentionById from './HashTagMentionById';

interface IMarkUpOnReply {
	mention: any[];
	onClickToMove: (e: React.MouseEvent<HTMLSpanElement>) => void;
	posMention?: boolean;
}

const MarkUpOnReply = ({ mention, onClickToMove, posMention }: IMarkUpOnReply) => {
	const processedMessage = mention.reduce((acc: any, item, index) => {
		let markUpId = '';

		if (item.matchedText.startsWith('<#') || item.matchedText.startsWith('@') || item.matchedText.startsWith(':')) {
			markUpId = item.matchedText;
		}

		if (markUpId) {
			acc.push(
				<span key={`nonMatchText-${index}`}>{item.nonMatchText}</span>,
				<HashTagMentionById posMention={posMention} key={`markUpId-${index}`} id={markUpId} />,
			);
		} else {
			acc.push(<span key={`nonMatchText-${index}`}>{item.nonMatchText}</span>);
		}
		return acc;
	}, []);

	return (
		<span
			onClick={onClickToMove}
			className={`inline dark:hover:text-white dark:text-[#A8BAB8] text-[#818388] hover:text-[#060607] cursor-pointer whitespace-nowrap noselect`}
		>
			{processedMessage}
		</span>
	);
};

export default memo(MarkUpOnReply);
