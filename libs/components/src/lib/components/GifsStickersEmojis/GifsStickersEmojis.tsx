import { useAppParams, useGifsStickersEmoji } from '@mezon/core';
import { selectIdMessageRefReaction } from '@mezon/store';
import { EmojiPlaces, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiChannelDescription } from 'mezon-js/api.gen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ClanSetting from '../ClanSettings';
import { ItemSetting } from '../ClanSettings/ItemObj';
import EmojiPickerComp from '../EmojiPicker';
import ImageSquare from './StickerSquare';
import TenorGifCategories from './gifs/TenorGifCategories';
import { InputSearch } from './inputSearch';

export type GifStickerEmojiPopupOptions = {
	emojiAction?: EmojiPlaces;
	mode?: number;
	channelOrDirect?: ApiChannelDescription;
};

export const GifStickerEmojiPopup = ({ emojiAction, mode, channelOrDirect }: GifStickerEmojiPopupOptions) => {
	const { type } = useAppParams();
	const [mod, setMod] = useState(0);
	const { subPanelActive, setSubPanelActive } = useGifsStickersEmoji();
	const { setValueInputSearch } = useGifsStickersEmoji();
	const [isShowSetting, setIsShowSetting] = useState(false);
	const idMessageRefReaction = useSelector(selectIdMessageRefReaction);

	useEffect(() => {
		if (Number(type) === ChannelType.CHANNEL_TYPE_GROUP) {
			setMod(ChannelStreamMode.STREAM_MODE_GROUP);
		} else if (Number(type) === ChannelType.CHANNEL_TYPE_DM) {
			setMod(ChannelStreamMode.STREAM_MODE_DM);
		} else {
			setMod(ChannelStreamMode.STREAM_MODE_CHANNEL);
		}
	}, [type]);
	const handleTabClick = (tab: SubPanelName) => {
		setValueInputSearch('');
		setSubPanelActive(tab);
	};

	const closePannel = useCallback(() => {
		setSubPanelActive(SubPanelName.NONE);
	}, []);

	const emojiRefParentDiv = useRef<HTMLDivElement>(null);

	const handleCloseSetting = () => {
		setIsShowSetting(false);
	};

	const handleOpenSetting = () => {
		setIsShowSetting(true);
	};

	const isShowEmojiPicker = () => {
		return (
			(subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT && window.innerWidth <= 640) ||
			(subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM && window.innerWidth <= 640) ||
			(emojiAction === EmojiPlaces.EMOJI_REACTION && window.innerWidth > 640) ||
			(emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM && window.innerWidth > 640)
		);
	};

	return (
		<>
			<div
				onClick={(e) => e.stopPropagation()}
				className={`w-[370px] max-sm:w-full max-sm:pt-0 max-sm:rounded-none max-sm:mt-[-0.5rem]
			sbm:w-[500px] max-sbm:w-[312px] max-sbm:rounded-lg h-fit rounded-lg dark:bg-bgSecondary bg-bgLightMode shadow shadow-neutral-900 z-30
			 ${emojiAction === EmojiPlaces.EMOJI_REACTION || emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM ? 'min-h-[400px]' : isShowEmojiPicker() ? 'min-h-[350px]' : 'min-h-[500px]'}`}
			>
				<div className="w-full">
					{!idMessageRefReaction && (
						<div className="flex justify-start flex-row mt-3 border-b border-blue-500 pb-1 pt-1 max-sm:justify-evenly">
							<button
								className={` relative px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.GIFS ? ' font-semibold dark:text-white text-black' : ' dark:text-gray-300 text-colorTextLightMode dark:hover:text-white hover:text-black '}`}
								onClick={() => handleTabClick(SubPanelName.GIFS)}
							>
								Gifs
							</button>
							<button
								className={` relative px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.STICKERS ? 'font-semibold dark:text-white text-black' : ' dark:text-gray-300 text-colorTextLightMode dark:hover:text-white hover:text-black '}`}
								onClick={() => handleTabClick(SubPanelName.STICKERS)}
							>
								Stickers
							</button>
							<button
								className={` relative px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.EMOJI ? 'font-semibold dark:text-white text-black' : ' dark:text-gray-300 text-colorTextLightMode dark:hover:text-white hover:text-black '}`}
								onClick={() => handleTabClick(SubPanelName.EMOJI)}
							>
								Emoji
							</button>
						</div>
					)}
					<InputSearch />
				</div>

				<div className="w-full min-h-[400px] text-center md:w-[500px]" ref={emojiRefParentDiv}>
					{subPanelActive === SubPanelName.GIFS && (
						<div className="flex h-full pr-1 w-full md:w-[500px]">
							<TenorGifCategories activeTab={SubPanelName.EMOJI} channelOrDirect={channelOrDirect} mode={mod} onClose={closePannel} />
						</div>
					)}

					{subPanelActive === SubPanelName.STICKERS && (
						<div className="flex h-full pr-2 w-full md:w-[500px]">
							<ImageSquare channel={channelOrDirect} mode={mod} onClose={closePannel} />
						</div>
					)}
					{subPanelActive === SubPanelName.EMOJI && (
						<div className="flex h-full pr-2 w-full md:w-[500px] sbm:w-[312px]">
							<EmojiPickerComp onClickAddButton={handleOpenSetting} onClose={closePannel} />
						</div>
					)}
					{isShowEmojiPicker() && (
						<div className="flex h-full pr-2 w-full md:w-[500px]">
							<EmojiPickerComp
								mode={mode}
								messageEmojiId={idMessageRefReaction}
								onClickAddButton={handleOpenSetting}
								onClose={closePannel}
							/>
						</div>
					)}
				</div>
			</div>

			{isShowSetting && <ClanSetting onClose={handleCloseSetting} initialSetting={ItemSetting.EMOJI} />}
		</>
	);
};
