import { Icons } from '@mezon/components';
import { useGifs, useGifsStickersEmoji, useReference } from '@mezon/core';
import { SubPanelName } from '@mezon/utils';
import { useCallback } from 'react';

export type GifStickerEmojiButtonsProps = {
	activeTab: SubPanelName;
};

function GifStickerEmojiButtons({ activeTab }: GifStickerEmojiButtonsProps) {
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();
	const { setReferenceMessage } = useReference();
	const { setShowCategories, setValueInputSearch } = useGifs();
	const handleOpenGifs = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.GIFS);
			setReferenceMessage(null);
			setShowCategories(true);
			setValueInputSearch('');
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
		},
		[setSubPanelActive],
	);

	return (
		<div className="flex flex-row h-full items-center gap-1 w-18 mr-3 absolute right-0">
			<div onClick={handleOpenGifs} className="cursor-pointer">
				<Icons.Gif defaultFill={`${subPanelActive === SubPanelName.GIFS ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>

			<div onClick={handleOpenStickers} className="cursor-pointer">
				<Icons.Sticker defaultFill={`${subPanelActive === SubPanelName.STICKERS ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>

			<div onClick={handleOpenEmoji} className="cursor-pointer">
				<Icons.Smile defaultFill={`${subPanelActive === SubPanelName.EMOJI ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>
		</div>
	);
}

export default GifStickerEmojiButtons;
