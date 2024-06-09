import { useAppParams, useEmojiSuggestion, useEscapeKey, useGifsStickersEmoji } from '@mezon/core';
import { selectCurrentChannel } from '@mezon/store';
import { EmojiPlaces, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import EmojiPickerComp from '../EmojiPicker';
import TenorGifCategories from './gifs/TenorGifCategories';
import { InputSearch } from './inputSearch';
import ImageSquare from './stickers';

export type GifStickerEmojiPopupOptions = {
	messageEmojiId?: string;
	emojiAction?: EmojiPlaces;
	mode?: number;
};

const GifStickerEmojiPopup = ({ messageEmojiId, emojiAction, mode }: GifStickerEmojiPopupOptions) => {
	const currentChannel = useSelector(selectCurrentChannel);
	const { type } = useAppParams();
	const [mod, setMod] = useState(0);
	const { subPanelActive, setSubPanelActive } = useGifsStickersEmoji();
	const { setValueInputSearch } = useGifsStickersEmoji();
	const { emojiListPNG, shiftPressedState, setShiftPressed } = useEmojiSuggestion();

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

	useEscapeKey(() => setSubPanelActive(SubPanelName.NONE));
	const emojiRefParentDiv = useRef<HTMLDivElement>(null);

	const handleShiftKeyDown = (event: KeyboardEvent) => {
		if (event.shiftKey) {
			event.stopPropagation();
			event.preventDefault();
			setShiftPressed(true);
		}
	};
	const handleShiftKeyUp = () => {
		setShiftPressed(false);
	};

	useEffect(() => {
		window.addEventListener('keydown', handleShiftKeyDown);
		window.addEventListener('keyup', handleShiftKeyUp);
		return () => {
			window.removeEventListener('keydown', handleShiftKeyDown);
			window.removeEventListener('keyup', handleShiftKeyUp);
		};
	}, []);

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			className={`w-[370px] max-sm:w-full max-sm:pt-0 max-sm:rounded-none max-sm:mt-[-0.5rem] 
			sbm:w-[500px] h-fit rounded-lg dark:bg-bgSecondary bg-bgLightMode shadow shadow-neutral-900 z-30
			 ${emojiAction === EmojiPlaces.EMOJI_REACTION || emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM ? 'min-h-[400px]' : 'min-h-[500px]'}`}
		>
			<div className="w-full">
				{emojiAction !== EmojiPlaces.EMOJI_REACTION && (
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
						<TenorGifCategories
							activeTab={SubPanelName.EMOJI}
							channelId={currentChannel?.id ?? ''}
							channelLabel={currentChannel?.channel_label ?? ''}
							mode={mod}
						/>
					</div>
				)}

				{subPanelActive === SubPanelName.STICKERS && (
					<div className="flex h-full pr-1 w-full md:w-[500px]">
						<ImageSquare channelId={currentChannel?.id ?? ''} channelLabel={currentChannel?.channel_label ?? ''} mode={mod} />
					</div>
				)}
				{subPanelActive === SubPanelName.EMOJI && (
					<div className="flex h-full pr-2 w-full md:w-[500px]">
						<EmojiPickerComp />
					</div>
				)}
				{subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT && window.innerWidth <= 640 && (
					<div className="flex h-full pr-2 w-full md:w-[500px]">
						<EmojiPickerComp mode={mode} messageEmojiId={messageEmojiId} />{' '}
					</div>
				)}
				{subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM && window.innerWidth <= 640 && (
					<div className="flex h-full pr-2 w-full md:w-[500px]">
						<EmojiPickerComp mode={mode} messageEmojiId={messageEmojiId} />{' '}
					</div>
				)}

				{emojiAction === EmojiPlaces.EMOJI_REACTION && window.innerWidth > 640 && (
					<div className="flex h-full pr-2 w-full md:w-[500px]">
						<EmojiPickerComp mode={mode} messageEmojiId={messageEmojiId} />
					</div>
				)}
				{emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM && window.innerWidth > 640 && (
					<div className="flex h-full pr-2 w-full md:w-[500px]">
						<EmojiPickerComp mode={mode} messageEmojiId={messageEmojiId} />
					</div>
				)}
			</div>
		</div>
	);
};

export default GifStickerEmojiPopup;
