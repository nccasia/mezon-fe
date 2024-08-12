import { getSrcEmoji, SHOW_POSITION } from '@mezon/utils';
import { memo, useCallback, useMemo, useState } from 'react';
import { useMessageContextMenu } from '../ContextMenu';
import PlainText from './PlainText';

type EmojiMarkupOpt = {
	emojiId: string;
	emojiSyntax: string;
	onlyEmoji: boolean;
	isSingleLine: boolean;
};

export const EmojiMarkup: React.FC<EmojiMarkupOpt> = ({ emojiId, emojiSyntax, onlyEmoji, isSingleLine }) => {
	const [className, setClassName] = useState<string>(`${onlyEmoji ? 'w-12' : 'w-6'}   inline-block relative -top-0.4 m-0`);

	const srcEmoji = useMemo(() => {
		return getSrcEmoji(emojiId);
	}, [emojiId]);

	const { setImageURL, setPositionShow } = useMessageContextMenu();

	const handleContextMenu = useCallback(() => {
		setImageURL(srcEmoji);
		setPositionShow(SHOW_POSITION.IN_EMOJI);
	}, [srcEmoji]);

	return (
		<span onContextMenu={handleContextMenu}>
			{srcEmoji ? (
				<img
					id={`emoji-${emojiSyntax}`}
					src={srcEmoji}
					alt={`[${emojiSyntax}](${emojiId})`}
					className={className}
					onDragStart={(e) => e.preventDefault()}
				/>
			) : (
				<PlainText isHover={false} isSingleLine={false} isJumMessageEnabled={false} text={emojiSyntax} />
			)}
		</span>
	);
};
export default memo(EmojiMarkup);
