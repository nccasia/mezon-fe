import { Metrics, size } from '@mezon/mobile-ui';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ScrollView } from 'react-native-gesture-handler';
import styles from './styles';

type StickerSelectorProps = {
	onSelected?: (url: string) => void;
	searchText: string;
};

// TODO: hard-code?
const cates = [
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
];
const images = [
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_4.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_18.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_1.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_7.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_17.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_4.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/CrocosaurusStickers/emojibest_com_crocosaurus_18.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_0.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_1.gif', type: 'cs' },
	{ url: 'https://cdn.mezon.vn/stickers/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_7.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_11.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/MemesWithCats/emojibest_com_memes_with_cats_17.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
	{ url: 'https://cdn.mezon.vn/stickers/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
];

const _stickers = [...new Set(images.map((item) => item.type))].map((item) => ({
	title: item,
	data: images.filter((_item) => _item.type == item).map((_item) => _item.url),
}));

export default function StickerSelector({ onSelected, searchText }: StickerSelectorProps) {
	const [stickers, setStickers] = useState(_stickers);

	useEffect(() => {
		// TODO:
	}, [searchText]);

	function handlePressSticker(url: string) {
		onSelected && onSelected(url);
	}

	return (
		<ScrollView style={{ maxHeight: Metrics.screenHeight / 1.4 }} contentContainerStyle={{ paddingBottom: size.s_50 * 2 }}>
			<ScrollView horizontal contentContainerStyle={styles.btnWrap}>
				{cates.map((item, index) => (
					<TouchableOpacity
						onPress={() => setStickers(_stickers.filter((sticker) => sticker.title === item.type))}
						style={styles.btnEmo}
						key={index.toString()}
					>
						<FastImage
							resizeMode={FastImage.resizeMode.cover}
							source={{
								uri: item.url,
								cache: FastImage.cacheControl.web,
								priority: FastImage.priority.high,
							}}
							style={{ height: '100%', width: '100%' }}
						/>
					</TouchableOpacity>
				))}
			</ScrollView>

			{stickers.map((emojisCate, indexCate) => (
				<View style={styles.session} key={indexCate.toString()}>
					<Text style={styles.sessionTitle}>{emojisCate.title}</Text>
					<View style={styles.sessionContent}>
						{emojisCate.data.map((item, index) => (
							<TouchableOpacity onPress={() => handlePressSticker(item)} style={styles.content} key={index.toString()}>
								<FastImage source={{ uri: item }} style={{ height: '100%', width: '100%' }} />
							</TouchableOpacity>
						))}
					</View>
				</View>
			))}
		</ScrollView>
	);
}
