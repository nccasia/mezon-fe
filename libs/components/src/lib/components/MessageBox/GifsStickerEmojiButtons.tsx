import { Icons } from '@mezon/components';
import { EmojiContext } from '@mezon/core';
import { TabNamePopup } from '@mezon/utils';
import { useCallback, useContext } from 'react';


function GifStickerEmojiButtons() {
	const { activeTab, setActiveTab } = useContext(EmojiContext);
	const handleOpenGifs = () => {
		setActiveTab(TabNamePopup.GIFS);
	};

	const handleOpenStickers = useCallback(() => {
		setActiveTab(TabNamePopup.STICKERS);
	}, []);

	const handleOpenEmoji = useCallback(() => {
		setActiveTab(TabNamePopup.EMOJI);
	}, []);

	return (
		<div className="flex flex-row h-full items-center gap-1 w-18 mr-3 relative">
			<div onClick={handleOpenGifs} className="cursor-pointer">
				<Icons.Gif defaultFill={`${activeTab === TabNamePopup.GIFS ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>

			<div onClick={handleOpenStickers} className="cursor-pointer">
				<Icons.Sticker defaultFill={`${activeTab === TabNamePopup.STICKERS ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>

			<div onClick={handleOpenEmoji} className="cursor-pointer">
				<Icons.Smile defaultFill={`${activeTab === TabNamePopup.EMOJI ? '#FFFFFF' : '#AEAEAE'}`} />
			</div>
		</div>
	);
}

export default GifStickerEmojiButtons;
