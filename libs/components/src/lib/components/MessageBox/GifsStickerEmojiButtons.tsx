import { Icons } from '@mezon/components';
import { useChatReaction, useGifs, useGifsStickersEmoji } from '@mezon/core';
import { reactionActions } from '@mezon/store';
import { SubPanelName } from '@mezon/utils';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export type GifStickerEmojiButtonsProps = {
	activeTab: SubPanelName;
};

function GifStickerEmojiButtons({ activeTab }: GifStickerEmojiButtonsProps) {
	const dispatch = useDispatch();
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();
	const { setShowCategories } = useGifs();
	const { setValueInputSearch } = useGifsStickersEmoji();
	const handleOpenGifs = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.GIFS);
			setShowCategories(true);
			setValueInputSearch('');
			dispatch(reactionActions.setReactionRightState(false));
			dispatch(reactionActions.setReactionBottomState(false));
		},
		[setSubPanelActive],
	);

	const handleOpenStickers = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.STICKERS);
			setShowCategories(true);
			setValueInputSearch('');
			dispatch(reactionActions.setReactionRightState(false));
			dispatch(reactionActions.setReactionBottomState(false));
		},
		[setSubPanelActive],
	);

	const handleOpenEmoji = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setShowCategories(true);
			setValueInputSearch('');
			dispatch(reactionActions.setReactionRightState(false));
			dispatch(reactionActions.setReactionBottomState(false));
			if (subPanelActive === SubPanelName.EMOJI) {
				setSubPanelActive(SubPanelName.NONE);
			} else {
				setSubPanelActive(SubPanelName.EMOJI);
			}
		},
		[setSubPanelActive, subPanelActive],
	);

	return (
		<div className="flex flex-row h-full items-center gap-1 w-18 mr-3  absolute right-0">
			<div onClick={handleOpenGifs} className="cursor-pointer block max-sm:hidden">
				<Icons.Gif defaultSize="w-6 h-6" isWhite={subPanelActive === SubPanelName.GIFS} />
			</div>

			<div onClick={handleOpenStickers} className="cursor-pointer block max-sm:hidden">
				<Icons.Sticker defaultSize="w-6 h-6" isWhite={subPanelActive === SubPanelName.STICKERS} />
			</div>

			<div onClick={handleOpenEmoji} className="cursor-pointer">
				<Icons.Smile defaultSize="w-6 h-6" defaultFill={`${subPanelActive === SubPanelName.EMOJI ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>
		</div>
	);
}

export default GifStickerEmojiButtons;
