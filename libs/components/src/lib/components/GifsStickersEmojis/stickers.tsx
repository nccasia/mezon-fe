import { useChatSending, useGifsStickersEmoji } from '@mezon/core';
import { IMessageSendPayload, SubPanelName } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { useCallback, useEffect, useState } from 'react';

type ChannelMessageBoxProps = {
	channelId: string;
	channelLabel: string;
	mode: number;
};

function ImageSquare({ channelId, channelLabel, mode }: ChannelMessageBoxProps) {
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
	// TODO: separate data to another file
	const avts = [
		{ id: 1, url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
		{ id: 2, url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
		{ id: 3, url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	];
	const images = [
		{ id: 1, url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
		{ id: 2, url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_4.gif', type: 'cs' },
		{ id: 3, url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_18.gif', type: 'cs' },
		{ id: 4, url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_0.gif', type: 'cs' },
		{ id: 5, url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_1.gif', type: 'cs' },
		{ id: 6, url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
		{ id: 7, url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_7.gif', type: 'dog' },
		{ id: 8, url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_11.gif', type: 'dog' },
		{ id: 9, url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_17.gif', type: 'dog' },
		{ id: 10, url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
		{ id: 11, url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
		{ id: 12, url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
		{ id: 13, url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
		{ id: 14, url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
		{ id: 15, url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
	];
	const { setSubPanelActive } = useGifsStickersEmoji();
	const [selectedType, setSelectedType] = useState('');
	const [selectImage, setSelectImage] = useState<any>(images);
	const handleClickImage = (imageUrl: string) => {
		handleSend({ t: '' }, [], [{ url: imageUrl, height: 40, width: 40, filetype: 'image/gif' }], []);
		setSubPanelActive(SubPanelName.NONE);
	};

	const handleClickAvt = (type: string) => {
		setSelectedType(type);
	};

	useEffect(() => {
		const filteredImages = selectedType ? images.filter((image) => image.type === selectedType) : images;
		setSelectImage(filteredImages);
	}, [selectedType]);

	return (
		<div className="flex h-full pr-2 w-full md:w-[500px]">
			<div className="w-[60%] md:w-[40%] md:max-w-[40%] flex flex-col px-2 gap-y-2 max-w-[60%]">
				{avts.map((avt) => (
					<img
						key={avt.id}
						src={avt.url}
						alt={`avt ${avt.id}`}
						className={`w-full h-auto cursor-pointer dark:hover:bg-bgDisable hover:bg-bgLightModeButton ${avt.type === selectedType ? 'bg-bgDisable' : ''} hover:rounded-lg justify-center items-center border border-bgHoverMember rounded-lg`}
						onClick={() => handleClickAvt(avt.type)}
						role="button"
					/>
				))}
			</div>
			<div className="w-auto pb-2">
				<div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-scroll hide-scrollbar">
					{selectImage.map((image: any) => (
						<img
							key={image.id}
							src={image.url}
							alt={`Img`}
							className="w-full h-auto cursor-pointer dark:hover:bg-bgDisable hover:bg-bgLightModeButton hover:rounded-lg border border-bgHoverMember rounded-lg"
							onClick={() => handleClickImage(image.url)}
							role='button'
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default ImageSquare;
