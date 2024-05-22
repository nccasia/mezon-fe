import {
	emojiSuggestionActions,
	selectEmojiListStatus,
	selectEmojiSuggestion,
	selectTextToSearchEmojiSuggestion,
	useAppDispatch,
} from '@mezon/store';
import { IEmoji } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useEmojiSuggestion() {
	const getEmojisFromLocalStorage = (): IEmoji[] | null => {
		try {
			const cachedData = localStorage.getItem('emojiCache');
			if (cachedData) {
				const cachedEmojis = JSON.parse(cachedData) as IEmoji[];
				return cachedEmojis;
			}
			return null; // Trả về null nếu không tìm thấy dữ liệu trong localStorage
		} catch (error) {
			console.error('Error retrieving emojis from localStorage:', error);
			return null;
		}
	};
	const emojisMetaData = getEmojisFromLocalStorage();

	function filterEmojiData(emojis: IEmoji[]) {
		return emojis.map(({ emoji, shortname, category }) => ({
			emoji,
			shortname,
			category,
		}));
	}
	const emojis = filterEmojiData(emojisMetaData ?? []);
	const getEmojisByCategories = (emojis: IEmoji[], categoryParam: string) => {
		const filteredEmojis = emojis
			.filter((emoji) => emoji.category.includes(categoryParam))
			.map((emoji) => ({
				...emoji,
				category: emoji.category.replace(/ *\([^)]*\) */g, ''),
			}));

		const first50Emojis = filteredEmojis.slice(0, 20);

		return first50Emojis;
	};

	const smileysEmotionEmojis = getEmojisByCategories(emojis, 'Smileys & Emotion');
	const peopleBodyEmojis = getEmojisByCategories(emojis, 'People & Body');
	const activitiesEmojis = getEmojisByCategories(emojis, 'Activities');
	const symbolsEmojis = getEmojisByCategories(emojis, 'Symbols');
	const objectsEmojis = getEmojisByCategories(emojis, 'Objects');
	const animalNatureEmojis = getEmojisByCategories(emojis, 'Animals & Nature');
	const travelPlacesEmojis = getEmojisByCategories(emojis, 'Travel & Places');
	const foodDrinkEmojis = getEmojisByCategories(emojis, 'Food & Drink');
	const flagsEmojis = getEmojisByCategories(emojis, 'Flags');

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
			smileysEmotionEmojis,
			peopleBodyEmojis,
			activitiesEmojis,
			symbolsEmojis,
			objectsEmojis,
			animalNatureEmojis,
			travelPlacesEmojis,
			foodDrinkEmojis,
			flagsEmojis,
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
			smileysEmotionEmojis,
			peopleBodyEmojis,
			activitiesEmojis,
			symbolsEmojis,
			objectsEmojis,
			animalNatureEmojis,
			travelPlacesEmojis,
			foodDrinkEmojis,
			flagsEmojis,
		],
	);
}
