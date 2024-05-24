import { Icons } from '@mezon/components';
import { useChatReaction, useGifs, useGifsStickersEmoji, useReference } from '@mezon/core';
import { SubPanelName } from '@mezon/utils';
import { useCallback } from 'react';

export type GifStickerEmojiButtonsProps = {
	activeTab: SubPanelName;
};

function GifStickerEmojiButtons({ activeTab }: GifStickerEmojiButtonsProps) {
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();
	const { setReferenceMessage } = useReference();
	const { setReactionRightState, setReactionBottomState } = useChatReaction();
	const { setShowCategories } = useGifs();
	const { setValueInputSearch } = useGifsStickersEmoji();
	const handleOpenGifs = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.GIFS);
			setReferenceMessage(null);
			setShowCategories(true);
			setValueInputSearch('');
			setReactionRightState(false);
			setReactionBottomState(false);
		},
		[setSubPanelActive],
	);

	const handleOpenStickers = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.STICKERS);
			setReferenceMessage(null);
			setShowCategories(true);
			setValueInputSearch('');
			setReactionRightState(false);
			setReactionBottomState(false);
		},
		[setSubPanelActive],
	);

	const handleOpenEmoji = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.EMOJI);
			setReferenceMessage(null);
			setShowCategories(true);
			setValueInputSearch('');
			setReactionRightState(false);
			setReactionBottomState(false);
		},
		[setSubPanelActive],
	);

	return (
		<div className="flex flex-row h-full items-center gap-1 w-18 mr-3 absolute right-0">
			<div onClick={handleOpenGifs} className="cursor-pointer">
				<Icons.Gif defaultSize="w-6 h-6" isWhite={subPanelActive === SubPanelName.GIFS} />
			</div>

			<div onClick={handleOpenStickers} className="cursor-pointer">
				<Icons.Sticker defaultSize="w-6 h-6" isWhite={subPanelActive === SubPanelName.STICKERS} />
			</div>

			<div onClick={handleOpenEmoji} className="cursor-pointer">
				<Icons.Smile defaultSize="w-6 h-6" defaultFill={`${subPanelActive === SubPanelName.EMOJI ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>
		</div>
	);
}

export default GifStickerEmojiButtons;
