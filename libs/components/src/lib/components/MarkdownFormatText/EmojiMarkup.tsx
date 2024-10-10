import { selectTheme } from '@mezon/store';
import { getSrcEmoji, SHOW_POSITION } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMessageContextMenu } from '../ContextMenu';
import PlainText from './PlainText';

type EmojiMarkupOpt = {
	emojiId: string;
	emojiSyntax: string;
	onlyEmoji: boolean;
	isOne: boolean;
};

export const EmojiMarkup: React.FC<EmojiMarkupOpt> = ({ emojiId, emojiSyntax, onlyEmoji, isOne }) => {
	const [className, setClassName] = useState<string>(`${onlyEmoji ? 'w-12' : 'w-6'} inline-block relative -top-0.4 m-0`);
	const appearanceTheme = useSelector(selectTheme);

	const srcEmoji = useMemo(() => {
		return getSrcEmoji(emojiId);
	}, [emojiId]);

	const { setImageURL, setPositionShow } = useMessageContextMenu();

	const handleContextMenu = useCallback(() => {
		setImageURL(srcEmoji);
		setPositionShow(SHOW_POSITION.IN_EMOJI);
	}, [srcEmoji]);

	const emojiElement = (
		<img
			id={`emoji-${emojiSyntax}`}
			src={srcEmoji}
			alt={`[${emojiSyntax}](${emojiId})`}
			className={className}
			onDragStart={(e) => e.preventDefault()}
		/>
	);

	return (
		<span onContextMenu={handleContextMenu} style={{ display: 'inline-block', height: '50px' }}>
			{srcEmoji ? (
				isOne ? (
					<Tooltip style={appearanceTheme === 'light' ? 'light' : 'dark'} content={emojiSyntax}>
						{emojiElement}
					</Tooltip>
				) : (
					emojiElement
				)
			) : (
				<PlainText text={emojiSyntax} />
			)}
		</span>
	);
};

export default memo(EmojiMarkup);
