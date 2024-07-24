import { useEmojiSuggestion } from '@mezon/core';
import { getSrcEmoji, SHOW_POSITION } from '@mezon/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMessageContextMenu } from '../ContextMenu';

type EmojiMarkupOpt = {
	emojiSyntax: string;
	onlyEmoji: boolean;
	posReply?: boolean;
};

export const EmojiMarkup: React.FC<EmojiMarkupOpt> = ({ emojiSyntax, onlyEmoji, posReply }) => {
	const { emojis } = useEmojiSuggestion();
	const [className, setClassName] = useState<string>(`${onlyEmoji ? 'w-12' : 'w-6'}  h-auto inline-block relative -top-0.5 m-0`);

	useEffect(() => {
		if (posReply) {
			setClassName(`w-4 h-auto inline-block relative -top-0.5 m-0`);
		}
	}, [posReply]);

	const srcEmoji = useMemo(() => {
		return getSrcEmoji(emojiSyntax.trim(), emojis);
	}, [emojiSyntax.trim()]);
	const { setImageURL, setPositionShow } = useMessageContextMenu();

	const handleContextMenu = useCallback(() => {
		setImageURL(srcEmoji);
		setPositionShow(SHOW_POSITION.IN_EMOJI);
	}, [srcEmoji]);

	return (
		<span onContextMenu={handleContextMenu} style={{ userSelect: 'none' }}>
			<img src={srcEmoji} alt={srcEmoji} className={className} onDragStart={(e) => e.preventDefault()} />
		</span>
	);
};
export default EmojiMarkup;
