import { useEmojis } from '@mezon/core';
import { IEmoji } from '@mezon/utils';
import { Ref, forwardRef, useEffect, useRef, useState } from 'react';

type EmojiSuggestionList = {
	valueInput: string;
};

const EmojiListSuggestion = forwardRef(({ valueInput = '' }: EmojiSuggestionList, ref: Ref<HTMLDivElement>) => {
	const { emojis, setEmojiSuggestion, setIsEmojiListShowed, isEmojiListShowed, setIsFocusEditorStatus, setTextToSearchEmojiSuggesion } =
		useEmojis();
	const [suggestions, setSuggestions] = useState<IEmoji[]>([]);
	const [inputCorrect, setInputCorrect] = useState<string>('');
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const ulRef = useRef<HTMLUListElement>(null);

	const pickEmoji = (emoji: IEmoji) => {
		setEmojiSuggestion(emoji.skins[0].native);

		setIsEmojiListShowed(false);
		setTextToSearchEmojiSuggesion('');
	};

	const searchEmojiByShortcode = (shortcode: string) => {
		const matchedEmojis: IEmoji[] = [];
		if (emojis) {
			for (const [key, emoji] of Object.entries(emojis)) {
				if (emoji.skins[0]?.shortcodes?.includes(shortcode)) {
					matchedEmojis.push(emoji);
				}
			}
		}
		return matchedEmojis;
	};

	function handleSearchSyntaxEmoji(text: string) {
		const regexSyntaxEmoji = /:([^\s:]+)(?:\s|$)/g;
		const regexSyntaxEmojiEndWithColon = /:([^\s:]+):/g;

		const matches = text.match(regexSyntaxEmoji);
		if (matches) {
			return matches.map((match) => match.slice(1));
		} else {
			const matchesEndWithColon = text.match(regexSyntaxEmojiEndWithColon);
			if (matchesEndWithColon) {
				const result = matchesEndWithColon.map((match) => match)[0];
				const searching = searchEmojiByShortcode(result);
				if (searching.length > 0) {
					const emojiFound = searching[0].skins[0].native;
					setEmojiSuggestion(emojiFound);
				}
				return;
			}
		}
		return [];
	}

	useEffect(() => {
		const detectedEmoji = handleSearchSyntaxEmoji(valueInput.toString());
		const emojiSearchWithOutPrefix = detectedEmoji && detectedEmoji[0];

		if (emojiSearchWithOutPrefix && emojiSearchWithOutPrefix.length >= 2) {
			setInputCorrect(emojiSearchWithOutPrefix);
		}
	}, [valueInput]);

	useEffect(() => {
		const emojiSuggestions = searchEmojiByShortcode(inputCorrect);
		setIsEmojiListShowed(true);
		setSuggestions(emojiSuggestions ?? []);
	}, [inputCorrect]);

	useEffect(() => {
		if (suggestions.length === 0) {
			setIsFocusEditorStatus(true);
		}
	}, [suggestions]);

	useEffect(() => {
		if (isEmojiListShowed) {
			if (ulRef.current) {
				const liElement = ulRef.current.children[selectedIndex] as HTMLLIElement | null;
				if (liElement) {
					liElement.focus();
				}
			}
		} else {
			setIsEmojiListShowed(false);
		}
	}, [suggestions]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
		switch (e.key) {
			case 'ArrowUp':
				e.preventDefault();
				setSelectedIndex((prevIndex) => (prevIndex === 0 ? suggestions.length - 1 : prevIndex - 1));
				break;
			case 'ArrowDown':
				e.preventDefault();
				setSelectedIndex((prevIndex) => (prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1));
				break;
			case 'Enter':
				e.preventDefault();
				pickEmoji(suggestions[selectedIndex]);
				break;
			default:
				e.preventDefault();
				setIsFocusEditorStatus(true);
				break;
		}
	};

	return (
		<>
			{isEmojiListShowed && valueInput !== '' && suggestions.length > 0 && (
				<div className="bg-[#2B2D31] p-3 mb-2 rounded-lg h-fit absolute bottom-10 w-full duration-100 outline-none" tabIndex={0} ref={ref}>
					<div className="mb-2 font-manrope text-xs font-semibold text-[#B1B5BC]">
						<p>Emoji Matching: {inputCorrect}</p>
					</div>
					<div className="w-full max-h-[20rem] h-fit overflow-y-scroll bg-[#2B2D31] hide-scrollbar">
						<ul ref={ulRef} tabIndex={0}>
							{suggestions.map((emoji: IEmoji, index) => (
								<li
									key={emoji.id}
									className={`cursor-pointer hover:bg-[#35373C] hover:rounded-sm flex justify-start items-center outline-none ${
										index === selectedIndex ? 'bg-[#35373C]' : ''
									}`}
									onKeyDown={(e) => handleKeyDown(e, index)}
									tabIndex={0}
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
});

export default EmojiListSuggestion;
