import { useChatSending } from '@mezon/core';
import { IMessageSendPayload } from '@mezon/utils';
import crocosaurus0 from 'libs/assets/src/assets/stickers/Crocosaurus Stickers/emojibest_com_crocosaurus_0.gif';
import crocosaurus18 from 'libs/assets/src/assets/stickers/Crocosaurus Stickers/emojibest_com_crocosaurus_18.gif';
import crocosaurus4 from 'libs/assets/src/assets/stickers/Crocosaurus Stickers/emojibest_com_crocosaurus_4.gif';
import EmojiDom13 from 'libs/assets/src/assets/stickers/EmojiDom/emojibest_com_emojidom_anim_13.gif';
import EmojiDom5 from 'libs/assets/src/assets/stickers/EmojiDom/emojibest_com_emojidom_anim_5.gif';
import EmojiDom8 from 'libs/assets/src/assets/stickers/EmojiDom/emojibest_com_emojidom_anim_8.gif';
import FredTheDog0 from 'libs/assets/src/assets/stickers/FredTheDog/emojibest_com_fred_the_pug_0 (1).gif';
import FredTheDog1 from 'libs/assets/src/assets/stickers/FredTheDog/emojibest_com_fred_the_pug_1.gif';
import FredTheDog11 from 'libs/assets/src/assets/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif';
import MemesWithCats11 from 'libs/assets/src/assets/stickers/Memes With Cats/emojibest_com_memes_with_cats_11.gif';
import MemesWithCats17 from 'libs/assets/src/assets/stickers/Memes With Cats/emojibest_com_memes_with_cats_17.gif';
import MemesWithCats7 from 'libs/assets/src/assets/stickers/Memes With Cats/emojibest_com_memes_with_cats_7.gif';
import SamuraiDojo0 from 'libs/assets/src/assets/stickers/SamuraiDojo/emojibest_com_samorai__dojo_0.gif';
import SamuraiDojo7 from 'libs/assets/src/assets/stickers/SamuraiDojo/emojibest_com_samorai__dojo_7.gif';
import SamuraiDojo8 from 'libs/assets/src/assets/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif';
import { useCallback, useEffect, useState } from 'react';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/api.gen';

type ChannelMessageBoxProps = {
	channelId: string;
	channelLabel: string;
	controlEmoji?: boolean;
	clanId?: string;
	mode: number;
};

function StickerPanel({ channelId, channelLabel, mode }: ChannelMessageBoxProps) {
	const { sendMessage } = useChatSending({ channelId, channelLabel, mode });

	const handleSend = useCallback(
		(
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
		) => {
			sendMessage(content, mentions, attachments, references);
		},
		[sendMessage],
	);

	const avts = [
		{ id: 1, url: 'https://www.emojibest.com/Crocosaurus/crocosaurus_1.webp', type: 'cs' },
		{ id: 2, url: 'https://www.emojibest.com/FredThePug/fred_the_pug_3.webp', type: 'dog' },
		{ id: 3, url: 'https://www.emojibest.com/MemesWithCats/memes_with_cats_0.webp', type: 'cat' },
	];
	const images = [
		{ id: 1, url: crocosaurus0, type: 'cs' },
		{ id: 2, url: crocosaurus4, type: 'cs' },
		{ id: 3, url: crocosaurus18, type: 'cs' },
		{ id: 4, url: FredTheDog0, type: 'cs' },
		{ id: 5, url: FredTheDog1, type: 'cs' },
		{ id: 6, url: FredTheDog11, type: 'dog' },
		{ id: 7, url: MemesWithCats7, type: 'dog' },
		{ id: 8, url: MemesWithCats11, type: 'dog' },
		{ id: 9, url: MemesWithCats17, type: 'dog' },
		{ id: 10, url: SamuraiDojo0, type: 'dog' },
		{ id: 11, url: SamuraiDojo7, type: 'cat' },
		{ id: 12, url: SamuraiDojo8, type: 'cat' },
		{ id: 13, url: EmojiDom5, type: 'cat' },
		{ id: 14, url: EmojiDom8, type: 'cat' },
		{ id: 15, url: EmojiDom13, type: 'cat' },
	];

	const [selectedType, setSelectedType] = useState('');
	const [selectImage, setSelectImage] = useState<any>(images);
	const handleClickImage = (imageUrl: string) => {
		handleSend({ t: '' }, [], [{ url: imageUrl, height: 40, width: 40, filetype: 'image/gif' }], []);
	};

	const handleClickAvt = (type: string) => {
		setSelectedType(type);
	};

	useEffect(() => {
		const filteredImages = selectedType ? images.filter((image) => image.type === selectedType) : images;
		setSelectImage(filteredImages);
	}, [selectedType]);
	return (
		<div className="flex h-full pr-2">
			<div className="w-[40%] flex flex-col px-2 gap-y-2 max-w-[40%]">
				{avts.map((avt) => (
					<img
						key={avt.id}
						src={avt.url}
						alt={`avt ${avt.id}`}
						className={`w-full h-auto cursor-pointer hover:bg-bgDisable ${avt.type === selectedType ? 'bg-bgDisable' : ''} hover:rounded-lg justify-center items-center border border-bgHoverMember rounded-lg`}
						onClick={() => handleClickAvt(avt.type)}
					/>
				))}
			</div>
			<div className="w-auto pb-2">
				<div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-scroll hide-scrollbar">
					{selectImage.map((image: any) => (
						<img
							key={image.id}
							src={image.url}
							alt={`Image ${image.id}`}
							className="w-full h-auto cursor-pointer hover:bg-bgDisable hover:rounded-lg border border-bgHoverMember rounded-lg"
							onClick={() => handleClickImage(image.url)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default StickerPanel;
