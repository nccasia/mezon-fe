import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import styles from "./styles";

type StickerSelectorProps = {
    onSelected?: (url: string) => void;
};

// TODO: hard-code?
const cates = [
    { url: 'https://cdn.mezon.vn/sticker/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
];
const images = [
    { url: 'https://cdn.mezon.vn/sticker/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/CrocosaurusStickers/emojibest_com_crocosaurus_4.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/CrocosaurusStickers/emojibest_com_crocosaurus_18.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/FredTheDog/emojibest_com_fred_the_pug_0.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/FredTheDog/emojibest_com_fred_the_pug_1.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/MemesWithCats/emojibest_com_memes_with_cats_7.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/MemesWithCats/emojibest_com_memes_with_cats_11.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/MemesWithCats/emojibest_com_memes_with_cats_17.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/CrocosaurusStickers/emojibest_com_crocosaurus_0.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/CrocosaurusStickers/emojibest_com_crocosaurus_4.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/CrocosaurusStickers/emojibest_com_crocosaurus_18.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/FredTheDog/emojibest_com_fred_the_pug_0.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/FredTheDog/emojibest_com_fred_the_pug_1.gif', type: 'cs' },
    { url: 'https://cdn.mezon.vn/sticker/FredTheDog/emojibest_com_fred_the_pug_11.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/MemesWithCats/emojibest_com_memes_with_cats_7.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/MemesWithCats/emojibest_com_memes_with_cats_11.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/MemesWithCats/emojibest_com_memes_with_cats_17.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_0.gif', type: 'dog' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_7.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/SamuraiDojo/emojibest_com_samorai__dojo_8.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_5.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_8.gif', type: 'cat' },
    { url: 'https://cdn.mezon.vn/sticker/EmojiDom/emojibest_com_emojidom_anim_13.gif', type: 'cat' },
];

export default function StickerSelector({ onSelected }: StickerSelectorProps) {
    const [stickers, setStickers] = useState<any>(images);

    function handlePressSticker(url: string) {
        onSelected && onSelected(url);
    }

    return (
        <>
            {/* <View style={styles.bottomCategory}>
                {cates.map((item, index) => (
                    <TouchableOpacity
                        // onPress={() => handlePressSticker(item.url)}
                        // style={styles.content}
                        key={index.toString()}>
                        <FastImage
                            source={{ uri: item.url }}
                            style={{ height: "100%", width: "100%" }} />
                    </TouchableOpacity>
                ))}
            </View> */}
            <View style={styles.session}>
                <Text style={styles.sessionTitle}>aaaa</Text>
                <View style={styles.sessionContent}>
                    {stickers.map((item, index) => (
                        <TouchableOpacity
                            onPress={() => handlePressSticker(item.url)}
                            style={styles.content}
                            key={index.toString()}>
                            <FastImage
                                source={{ uri: item.url }}
                                style={{ height: "100%", width: "100%" }} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

        </>
    )
}