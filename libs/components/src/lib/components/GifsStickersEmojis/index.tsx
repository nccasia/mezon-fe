import { useAppParams, useChatReaction, useEscapeKey, useGifs, useGifsStickersEmoji } from '@mezon/core';
import { selectCurrentChannel } from '@mezon/store';
import { EmojiPlaces, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import EmojiPickerComp from '../EmojiPicker';
import TenorGifCategories from './gifs/TenorGifCategories';
import { InputSearch } from './inputSearch';
import ImageSquare from './stickers';

const GifStickerEmojiPopup = () => {
	const currentChannel = useSelector(selectCurrentChannel);
	const { type } = useAppParams();
	const [mod, setMod] = useState(0);

	const { subPanelActive, setSubPanelActive } = useGifsStickersEmoji();
	const { setReactionPlaceActive } = useChatReaction();
	const { setShowCategories, setValueInputSearch } = useGifs();

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

	return (
		<div className="flex flex-col items-center w-full md:w-[500px] h-fit min-h-[500px] rounded-lg bg-[#222222] transform scale-100">
			<div className=" w-full">
				<div className="flex justify-start flex-row w-full mt-2 border-b border-blue-500 pb-2">
					<button
						className={` px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.GIFS ? ' font-semibold' : ' text-gray-300 hover:text-white'}`}
						onClick={() => handleTabClick(SubPanelName.GIFS)}
					>
						Gifs
					</button>
					<button
						className={` px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.STICKERS ? 'font-semibold' : ' text-gray-300 hover:text-white'}`}
						onClick={() => handleTabClick(SubPanelName.STICKERS)}
					>
						Stickers
					</button>
					<button
						className={`px-2 mx-2 rounded-md ${subPanelActive === SubPanelName.EMOJI ? 'font-semibold' : ' text-gray-300 hover:text-white'}`}
						onClick={() => handleTabClick(SubPanelName.EMOJI)}
					>
						Emoji
					</button>
				</div>
				{subPanelActive !== SubPanelName.EMOJI && <InputSearch />}
			</div>

			<div className="w-full h-fit border">
				{subPanelActive === SubPanelName.GIFS && (
					<div>
						<TenorGifCategories
							activeTab={SubPanelName.EMOJI}
							channelId={currentChannel?.id || ''}
							channelLabel={currentChannel?.channel_label || ''}
							mode={mod}
						/>
					</div>
				)}

				{subPanelActive === SubPanelName.STICKERS && (
					<ImageSquare channelId={currentChannel?.id || ''} channelLabel={currentChannel?.channel_label || ''} mode={mod} />
				)}

				{subPanelActive === SubPanelName.EMOJI && <EmojiPickerComp emojiAction={EmojiPlaces.EMOJI_EDITOR} />}
			</div>
		</div>
	);
};

export default GifStickerEmojiPopup;
