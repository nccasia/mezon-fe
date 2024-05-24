import {
	emojiSuggestionActions,
	selectAllEmojiSuggestion,
	selectEmojiListStatus,
	selectEmojiSuggestion,
	selectTextToSearchEmojiSuggestion,
	useAppDispatch,
} from '@mezon/store';
import { IEmoji } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useEmojiSuggestion() {
	const emojisMetaData = useSelector(selectAllEmojiSuggestion);

	function filterEmojiData(emojis: IEmoji[]) {
		return emojis.map(({ emoji, shortname, category }) => ({
			emoji,
			shortname,
			category,
		}));
	}
	const emojis = filterEmojiData(emojisMetaData ?? []);
	const isEmojiListShowed = useSelector(selectEmojiListStatus);
	const emojiPicked = useSelector(selectEmojiSuggestion);
	const textToSearchEmojiSuggestion = useSelector(selectTextToSearchEmojiSuggestion);

	const dispatch = useAppDispatch();
	const setEmojiSuggestion = useCallback(
		(emoji: string) => {
			dispatch(emojiSuggestionActions.setSuggestionEmojiPicked(emoji));
		},
		[dispatch],
	);

	const setIsEmojiListShowed = useCallback(
		(isOpen: boolean) => {
			dispatch(emojiSuggestionActions.setStatusSuggestionEmojiList(isOpen));
		},
		[dispatch],
	);

	const setTextToSearchEmojiSuggesion = useCallback(
		(textSearch: string) => {
			dispatch(emojiSuggestionActions.setTextToSearchEmojiSuggestion(textSearch));
		},
		[dispatch],
	);

	const categoriesEmoji = (emojis: IEmoji[]) => {
		const categories = emojis.map((emoji) => emoji.category.replace(/ *\([^)]*\) */g, ''));
		return [...new Set(categories)];
	};

	return useMemo(
		() => ({
			emojis,
			emojiPicked,
			setEmojiSuggestion,
			setIsEmojiListShowed,
			isEmojiListShowed,
			textToSearchEmojiSuggestion,
			setTextToSearchEmojiSuggesion,
			categoriesEmoji,
		}),
		[
			emojis,
			emojiPicked,
			setEmojiSuggestion,
			setIsEmojiListShowed,
			isEmojiListShowed,
			textToSearchEmojiSuggestion,
			setTextToSearchEmojiSuggesion,
			categoriesEmoji,
		],
	);
}
