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
			{emojiList
				.filter((item) => !!item.id)
				.map((item, index) => (
					<ReactionItem
						key={index}
						emojiShortCode={item.shortname || ''}
						emojiId={item.id || ''}
						activeMode={activeMode}
						messageId={messageId}
					/>
				))}
		</div>
	);
};

export default memo(ReactionPart);
