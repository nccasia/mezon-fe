import { Icons } from '@mezon/components';
import { useAppParams, useGifs, useGifsStickersEmoji } from '@mezon/core';
import { reactionActions, settingClanStickerActions, useAppDispatch } from '@mezon/store';
import { SubPanelName } from '@mezon/utils';
import { memo, useCallback } from 'react';

export type GifStickerEmojiButtonsProps = {
	activeTab: SubPanelName;
	currentClanId?: string;
};

const GifStickerEmojiButtons = memo(({ activeTab, currentClanId }: GifStickerEmojiButtonsProps) => {
	const dispatch = useAppDispatch();
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();
	const { setShowCategories } = useGifs();
	const { setValueInputSearch } = useGifsStickersEmoji();
	const { directId: currentDmGroupId } = useAppParams();

	const handleOpenGifs = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.GIFS);
			setShowCategories(true);
			setValueInputSearch('');
			dispatch(reactionActions.setReactionRightState(false));
			dispatch(reactionActions.setReactionBottomState(false));
			if (subPanelActive === SubPanelName.GIFS) {
				setSubPanelActive(SubPanelName.NONE);
			} else {
				setSubPanelActive(SubPanelName.GIFS);
			}
		},
		[subPanelActive, setSubPanelActive],
	);

	const handleOpenStickers = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.STICKERS);
			setShowCategories(true);
			setValueInputSearch('');
			// if there is currentDmGroupId is fetch for DM
			dispatch(settingClanStickerActions.fetchStickerByClanId({ clanId: currentDmGroupId ? '0' : (currentClanId as string) }));
			dispatch(reactionActions.setReactionRightState(false));
			dispatch(reactionActions.setReactionBottomState(false));
			if (subPanelActive === SubPanelName.STICKERS) {
				setSubPanelActive(SubPanelName.NONE);
			} else {
				setSubPanelActive(SubPanelName.STICKERS);
			}
		},
		[subPanelActive, setSubPanelActive],
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
		<div className="flex flex-row h-full items-center gap-1 mr-3  ">
			<div onClick={handleOpenGifs} className="cursor-pointer block max-sm:hidden w-6 h-6">
				<Icons.Gif defaultSize="w-6 h-6" isWhite={subPanelActive === SubPanelName.GIFS} />
			</div>

			<div onClick={handleOpenStickers} className="cursor-pointer block max-sm:hidden w-6 h-6">
				<Icons.Sticker defaultSize="w-6 h-6" isWhite={subPanelActive === SubPanelName.STICKERS} />
			</div>

			<div onClick={handleOpenEmoji} className="cursor-pointer w-6 h-6">
				<Icons.Smile defaultSize="w-6 h-6" defaultFill={`${subPanelActive === SubPanelName.EMOJI ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>
		</div>
	);
});

export default GifStickerEmojiButtons;
