import { IEmoji } from '@mezon/utils';
import { memo } from 'react';
import ReactionItem from '../ReactionItem';

interface IReactionPart {
	emojiList: IEmoji[];
	activeMode: number | undefined;
	messageId: string;
}

const ReactionPart: React.FC<IReactionPart> = ({ emojiList, activeMode, messageId }) => {
	return (
		<div className="flex justify-start gap-x-1 mb-1">
			{emojiList.map((item, index) => {
				return <ReactionItem key={index} emojiShortCode={item.shortname} activeMode={activeMode} messageId={messageId} />;
			})}
		</div>
	);
};

export default memo(ReactionPart);
