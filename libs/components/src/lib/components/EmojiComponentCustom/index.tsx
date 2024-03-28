import { ChatContext } from '@mezon/core';
import emojisData from 'apps/chat/src/assets/dataEmoji/metaDataEmojis.json';
import { useContext, useEffect, useState } from 'react';

// Xác định kiểu cho dữ liệu emoji

interface Emoji {
	id: string;
	name: string;
	emoticons: string[];
	keywords: string[];
	skins: Skin[];
	version: number;
	search: string;
}

interface Skin {
	unified: string;
	native: string;
	shortcodes: string;
}

type EmojiSuggestionList = {
	valueInput: string;
	isOpen?: boolean;
};

function EmojiList({ valueInput = '' }: EmojiSuggestionList) {
	const [selectedEmoji, setSelectedEmoji] = useState<Emoji | null>(null);
	const [suggestions, setSuggestions] = useState<Emoji[]>([]);
	const regexDetectEmoji = /:[^\s]{2,}/;
	const [inputCorrect, setInputCorrect] = useState<string>('');
	const { emoijiSelectedFromSuggestion, setEmojiSelectedFromSuggstion } = useContext(ChatContext);

	const pickEmoji = (emoji: Emoji) => {
		setSelectedEmoji(emoji);
		setEmojiSelectedFromSuggstion(emoji.skins[0].native);
	};

	const searchEmojiByShortcode = (shortcode: string) => {
		const matchedEmojis: Emoji[] = [];
		for (const emoji of Object.values(emojisData.emojis)) {
			const emojiWithShortcodes = emoji as Emoji;
			if (emojiWithShortcodes.skins[0]?.shortcodes?.includes(shortcode)) {
				matchedEmojis.push(emojiWithShortcodes);
			}
		}
		return matchedEmojis;
	};

	useEffect(() => {
		const matches = regexDetectEmoji.exec(valueInput)?.[0];
		const emojiPickerActive = matches?.startsWith(':');
		const lastEmojiIdx = emojiPickerActive ? valueInput.lastIndexOf(':') : null;
		const emojiSearch = emojiPickerActive ? valueInput.slice(Number(lastEmojiIdx)) : null;
		const emojiSearchWithOutPrefix = emojiSearch?.slice(1);
		setInputCorrect(emojiSearchWithOutPrefix ?? '');
	}, [valueInput]);

	useEffect(() => {
		const emojiSuggestions = searchEmojiByShortcode(inputCorrect);
		setSuggestions(emojiSuggestions);
	}, [inputCorrect]);

	return (
		<>
			{inputCorrect && suggestions.length > 0 && (
				<div className="bg-[#2B2D31] p-3 mb-2 rounded-lg h-fit absolute bottom-10 w-full">
					<div className="mb-2 font-manrope text-xs font-semibold text-[#B1B5BC]">
						<p>Emoji Matching: {inputCorrect}</p>
					</div>
					<div className="w-full max-h-[20rem] h-fit overflow-y-scroll bg-[#2B2D31] hide-scrollbar">
						<ul>
							{suggestions.map((emoji: Emoji) => (
								<li
									key={emoji.id}
									className="cursor-pointer hover:bg-[#35373C] hover:rounded-sm flex justify-start items-center"
									onClick={() => pickEmoji(emoji)}
								>
									<span className="text-xl w-10 ml-1">{emoji.skins[0].native}</span>
									<span className="text-xs font-manrope">{emoji.skins[0].shortcodes}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</>
	);
}

export default EmojiList;
