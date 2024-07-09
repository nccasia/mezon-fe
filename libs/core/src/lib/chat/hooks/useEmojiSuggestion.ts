import {
	emojiSuggestionActions,
	selectAddEmojiState,
	selectAllEmojiSuggestion,
	selectEmojiListStatus,
	selectEmojiSuggestion,
	selectShiftPressedStatus,
	selectTextToSearchEmojiSuggestion,
	useAppDispatch,
} from '@mezon/store';
import { EmojiStorage, IEmoji } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

const categoriesEmoji = ['Recent', 'Custom', 'People', 'Nature', 'Food', 'Activities', 'Travel', 'Objects', 'Symbols', 'Flags'];

const filterEmojiData = (emojis: IEmoji[]) => {
	return emojis.map(({ src, shortname, category }) => ({
		src,
		category,
		shortname,
	}));
};

export function useEmojiSuggestion() {
	const userId = useAuth();
	function filterEmojisByUserId(emojis: EmojiStorage[], userId: string): EmojiStorage[] {
		return emojis.filter((emojiItem) => emojiItem.senderId === userId);
	}

	function convertedEmojiRecent(emojiArr: EmojiStorage[], emojiSource: any) {
		return emojiArr.map((item: any) => {
			const emojiFound = Array.isArray(emojiSource) && emojiSource.find((emoji: any) => emoji.shortname === item.emoji);
			return {
				src: emojiFound?.src,
				category: 'Recent',
				shortname: emojiFound?.shortname,
			};
		});
	}
	const emojiMetadata = useSelector(selectAllEmojiSuggestion);
	const emojiRecentData = localStorage.getItem('recentEmojis');
	const emojisRecentDataParse = emojiRecentData ? JSON.parse(emojiRecentData) : [];
	const emojiFiltered = filterEmojisByUserId(emojisRecentDataParse, userId.userId ?? '');
	const reversedEmojisRecentDataParse = emojiFiltered.reverse();

	const emojiConverted = convertedEmojiRecent(reversedEmojisRecentDataParse, emojiMetadata);
	const emojiCombine = [...emojiMetadata, ...emojiConverted];
	const emojis = useMemo(() => filterEmojiData(emojiCombine), [emojiCombine]);
	const isEmojiListShowed = useSelector(selectEmojiListStatus);
	const emojiPicked = useSelector(selectEmojiSuggestion);
	const textToSearchEmojiSuggestion = useSelector(selectTextToSearchEmojiSuggestion);
	const addEmojiState = useSelector(selectAddEmojiState);
	const shiftPressedState = useSelector(selectShiftPressedStatus);

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

	const setAddEmojiActionChatbox = useCallback(
		(isAdd: boolean) => {
			dispatch(emojiSuggestionActions.setAddEmojiActionChatbox(isAdd));
		},
		[dispatch],
	);

	const setShiftPressed = useCallback(
		(isPress: boolean) => {
			dispatch(emojiSuggestionActions.setShiftPressed(isPress));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			emojiPicked,
			setEmojiSuggestion,
			setIsEmojiListShowed,
			isEmojiListShowed,
			textToSearchEmojiSuggestion,
			setTextToSearchEmojiSuggesion,
			categoriesEmoji,
			setAddEmojiActionChatbox,
			addEmojiState,
			setShiftPressed,
			shiftPressedState,
			emojis,
			emojiConverted,
		}),
		[
			emojiPicked,
			setEmojiSuggestion,
			setIsEmojiListShowed,
			isEmojiListShowed,
			textToSearchEmojiSuggestion,
			setTextToSearchEmojiSuggesion,
			setAddEmojiActionChatbox,
			addEmojiState,
			setShiftPressed,
			shiftPressedState,
			emojis,
			emojiConverted,
		],
	);
}
