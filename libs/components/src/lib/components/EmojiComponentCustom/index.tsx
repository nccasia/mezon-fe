import { useEmojis } from '@mezon/core';
import { IEmoji } from '@mezon/utils';
import { useEffect, useState } from 'react';

type EmojiSuggestionList = {
	valueInput: string;
	isOpen?: boolean;
};

function EmojiList({ valueInput = '' }: EmojiSuggestionList) {
	const { emojis, setEmojiSuggestion } = useEmojis();
	const [suggestions, setSuggestions] = useState<IEmoji[]>([]);
	const [inputCorrect, setInputCorrect] = useState<string>('');

	const pickEmoji = (emoji: IEmoji) => {
		setEmojiSuggestion(emoji.skins[0].native);
	};

	const searchEmojiByShortcode = (shortcode: string) => {
		const matchedEmojis: IEmoji[] = [];
		if (emojis) {
			for (const [key, emoji] of Object.entries(emojis)) {
				console.log(emoji.skins[0]?.shortcodes);
				console.log(`:${shortcode}:`);
				console.log('shortcode', emoji.skins[0]?.shortcodes === ':' + shortcode + ':');
				if (emoji.skins[0]?.shortcodes?.includes(shortcode)) {
					matchedEmojis.push(emoji);
					if (emoji.skins[0]?.shortcodes === ':' + shortcode + ':') {
						setEmojiSuggestion(emoji.skins[0].native);
					}
				}
			}
		}
		return matchedEmojis;
	};

	function handleSearchSyntaxEmoji(text: string) {
		const regexSyntaxEmoji = /:([^\s:]+)/g;
		const matches = text.match(regexSyntaxEmoji);
		if (matches) {
			return matches.map((match) => match.slice(1));
		}
		return [];
	}

	useEffect(() => {
		const detectedEmoji = handleSearchSyntaxEmoji(valueInput);
		const emojiSearchWithOutPrefix = detectedEmoji[0];
		setInputCorrect(emojiSearchWithOutPrefix ?? '');
	}, [valueInput]);

	useEffect(() => {
		const emojiSuggestions = searchEmojiByShortcode(inputCorrect);
		setSuggestions(emojiSuggestions ?? []);
	}, [inputCorrect]);

	return (
		<>
			{inputCorrect && suggestions.length > 0 && (
				<div className="bg-[#2B2D31] p-3 mb-2 rounded-lg h-fit absolute bottom-10 w-full duration-100">
					<div className="mb-2 font-manrope text-xs font-semibold text-[#B1B5BC]">
						<p>Emoji Matching: {inputCorrect}</p>
					</div>
					<div className="w-full max-h-[20rem] h-fit overflow-y-scroll bg-[#2B2D31] hide-scrollbar">
						<ul>
							{suggestions.map((emoji: IEmoji) => (
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
