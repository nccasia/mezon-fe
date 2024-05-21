import { useAppParams, useChatReaction, useEscapeKey, useGifs, useGifsStickersEmoji } from '@mezon/core';
import { selectCurrentChannel } from '@mezon/store';
import { EmojiPlaces, IMessageWithUser, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import TenorGifCategories from './gifs/TenorGifCategories';
import { InputSearch } from './inputSearch';
import ImageSquare from './stickers';

export type GifStickerEmojiPopupOptions = {
	messageEmoji?: IMessageWithUser;
	emojiAction?: EmojiPlaces;
	mode?: number;
};
const EmojiPanel = React.lazy(() => import('../EmojiPicker'));

const GifStickerEmojiPopup = ({ messageEmoji, emojiAction, mode }: GifStickerEmojiPopupOptions) => {
	const currentChannel = useSelector(selectCurrentChannel);
	const { type } = useAppParams();
	const [mod, setMod] = useState(0);

	const { subPanelActive, setSubPanelActive } = useGifsStickersEmoji();
	const { setReactionPlaceActive } = useChatReaction();
	const { setShowCategories } = useGifs();
	const { setValueInputSearch } = useGifsStickersEmoji();

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
		setShowCategories(true);
		setValueInputSearch('');
		if (tab === SubPanelName.EMOJI) {
			setReactionPlaceActive(EmojiPlaces.EMOJI_EDITOR);
		}

		setSubPanelActive(tab);
	};

	useEscapeKey(() => setSubPanelActive(SubPanelName.NONE));

	const emojiRefParentDiv = useRef<HTMLDivElement>(null);
	const [emojiDivWidth, setEmojiDivWidth] = useState<number | undefined>();

	useEffect(() => {
		if (emojiRefParentDiv.current) {
			const width = emojiRefParentDiv.current.getBoundingClientRect().width;
			setEmojiDivWidth(width);
		}
	}, [emojiRefParentDiv]);

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			className={`w-[370px] sbm:w-[500px] h-fit rounded-lg dark:bg-bgSecondary bg-bgLightMode shadow shadow-neutral-900 ${emojiAction === EmojiPlaces.EMOJI_REACTION || emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM ? 'min-h-[400px]' : 'min-h-[500px]'}`}
		>
			<div className="w-full">
				{emojiAction !== EmojiPlaces.EMOJI_REACTION && emojiAction !== EmojiPlaces.EMOJI_REACTION_BOTTOM && (
					<div className="flex justify-start flex-row mt-3 border-b border-blue-500 pb-1 pt-1">
						<button
							className={`relative px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.GIFS ? ' font-semibold dark:text-white text-black' : ' dark:text-gray-300 text-colorTextLightMode dark:hover:text-white hover:text-black '}`}
							onClick={() => handleTabClick(SubPanelName.GIFS)}
						>
							Gifs
						</button>
						<button
							className={`relative px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.STICKERS ? 'font-semibold dark:text-white text-black' : ' dark:text-gray-300 text-colorTextLightMode dark:hover:text-white hover:text-black '}`}
							onClick={() => handleTabClick(SubPanelName.STICKERS)}
						>
							Stickers
						</button>
						<button
							className={`relative px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.EMOJI ? 'font-semibold dark:text-white text-black' : ' dark:text-gray-300 text-colorTextLightMode dark:hover:text-white hover:text-black '}`}
							onClick={() => handleTabClick(SubPanelName.EMOJI)}
						>
							Emoji
						</button>
					</div>
				)}
				<InputSearch />
			</div>

			<div className="w-full min-h-[400px] text-center md:w-[500px] " ref={emojiRefParentDiv}>
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
						<Suspense fallback={<div className="flex justify-center items-center text-xs w-full">Loading...</div>}>
							<EmojiPanel emojiAction={EmojiPlaces.EMOJI_EDITOR} />
						</Suspense>
					</div>
				)}
				{emojiAction === EmojiPlaces.EMOJI_REACTION && (
					<div className="flex h-full pr-2 w-full md:w-[500px]">
						<Suspense fallback={<div className="flex justify-center items-center text-xs w-full">Loading...</div>}>
							<EmojiPanel emojiAction={EmojiPlaces.EMOJI_REACTION} mode={mode} messageEmoji={messageEmoji} />
						</Suspense>
					</div>
				)}
				{emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM && (
					<div className="flex h-full pr-2 w-full md:w-[500px]">
						<Suspense fallback={<div className="flex justify-center items-center text-xs w-full">Loading...</div>}>
							<EmojiPanel emojiAction={EmojiPlaces.EMOJI_REACTION_BOTTOM} mode={mode} messageEmoji={messageEmoji} />
						</Suspense>
					</div>
				)}
			</div>
		</div>
	);
};

export default GifStickerEmojiPopup;
