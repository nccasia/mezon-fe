import { ChatContext, useAppParams } from '@mezon/core';
import { selectCurrentChannel } from '@mezon/store';
import { EmojiPlaces, TabNamePopup } from '@mezon/utils';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// import EmojiPicker from '../EmojiPicker';
import { EmojiClickData } from 'emoji-picker-react';
import EmojiPickerComp from '../EmojiPicker';
import GiphyComp from './gifs/gifs';
import { InputSearch } from './inputSearch';
import ImageSquare from './stickers';
import { ChannelStreamMode } from '@mezon/mezon-js';
const GifStickerEmojiPopup = () => {
	const { activeTab, setActiveTab } = useContext(ChatContext);
	const currentChannel = useSelector(selectCurrentChannel);
	const { type } = useAppParams();
	const [ mod, setMod] = useState(0);
	useEffect(()=>{
		if (type === "2") {
			setMod(ChannelStreamMode.STREAM_MODE_GROUP)
		} else if (type === "3"){
			setMod(ChannelStreamMode.STREAM_MODE_DM)
		} else {
			setMod(ChannelStreamMode.STREAM_MODE_CHANNEL)
		}
	},[type])
	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
	};


	return (
		<div className="flex flex-col items-center w-[500px] h-fit min-h-[500px] rounded-lg bg-[#222222]">
			<div className=" w-full">
				<div className="flex justify-start flex-row w-full mt-2 border-b border-blue-500 pb-2">
					<button
						className={` px-2 mx-2 rounded-md ${activeTab === TabNamePopup.GIFS ? ' font-semibold' : ' text-gray-300 hover:text-white'}`}
						onClick={() => handleTabClick(TabNamePopup.GIFS)}
					>
						Gifs
					</button>
					<button
						className={` px-2 mx-2 rounded-md ${activeTab === TabNamePopup.STICKERS ? 'font-semibold' : ' text-gray-300 hover:text-white'}`}
						onClick={() => handleTabClick(TabNamePopup.STICKERS)}
					>
						Stickers
					</button>
					<button
						className={`px-2 mx-2 rounded-md ${activeTab === TabNamePopup.EMOJI ? 'font-semibold' : ' text-gray-300 hover:text-white'}`}
						onClick={() => handleTabClick(TabNamePopup.EMOJI)}
					>
						Emoji
					</button>
				</div>
				{activeTab !== TabNamePopup.EMOJI && <InputSearch />}
			</div>

			<div className="w-full h-fit">
				{activeTab === TabNamePopup.GIFS && (
					<div>
						<GiphyComp channelId={currentChannel?.id || ''} channelLabel={currentChannel?.channel_label || ''} mode={mod} />
					</div>
				)}

				{activeTab === TabNamePopup.STICKERS && (
					<ImageSquare channelId={currentChannel?.id || ''} channelLabel={currentChannel?.channel_label || ''} mode={mod} />
				)}

				{activeTab === TabNamePopup.EMOJI && <EmojiPickerComp emojiAction={EmojiPlaces.EMOJI_EDITOR} />}
			</div>
		</div>
	);
};

export default GifStickerEmojiPopup;
