import { getSrcEmoji, SHOW_POSITION } from '@mezon/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMessageContextMenu } from '../ContextMenu';
import PlainText from './PlainText';

type EmojiMarkupOpt = {
	emojiId: string;
	emojiSyntax: string;
	onlyEmoji: boolean;
	posReply?: boolean;
	showOnChannelLayOut?: boolean;
};

export const EmojiMarkup: React.FC<EmojiMarkupOpt> = ({ emojiId, emojiSyntax, onlyEmoji, posReply, showOnChannelLayOut }) => {
	const [className, setClassName] = useState<string>(`${onlyEmoji ? 'w-12' : 'w-6'}  h-auto inline-block relative -top-0.5 m-0`);

	useEffect(() => {
		if (posReply) {
			setClassName(`w-4 h-auto inline-block relative -top-0.5 m-0`);
		}
	}, [posReply]);

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
					alt={`[:${emojiSyntax}]`}
					className={className}
					onDragStart={(e) => e.preventDefault()}
				/>
			) : (
				<PlainText showOnchannelLayout={showOnChannelLayOut} text={emojiSyntax} />
			)}
		</span>
	);
};
export default EmojiMarkup;
