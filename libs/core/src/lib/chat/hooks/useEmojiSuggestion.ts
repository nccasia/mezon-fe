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
import { IEmoji } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useDataEmojiSvg from './useDataEmojiSvg';

const categoriesEmoji = ['Custom', 'People', 'Nature', 'Food', 'Activities', 'Travel', 'Objects', 'Symbols', 'Flags'];

const filterEmojiData = (emojis: IEmoji[]) => {
	return emojis.map(({ emoji, shortname, category, name }) => ({
		name,
		emoji,
		shortname,
		category,
	}));
};

export function useEmojiSuggestion() {
	const emojisMetaData = useSelector(selectAllEmojiSuggestion);
	const { emojiListPNG } = useDataEmojiSvg();

	const emojis = useMemo(() => filterEmojiData(emojisMetaData ?? []), [emojisMetaData]);
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
			emojis,
			emojiPicked,
			setEmojiSuggestion,
			setIsEmojiListShowed,
			isEmojiListShowed,
			textToSearchEmojiSuggestion,
			setTextToSearchEmojiSuggesion,
			categoriesEmoji,
			emojiListPNG,
			setAddEmojiActionChatbox,
			addEmojiState,
			setShiftPressed,
			shiftPressedState,
		}),
		[
			emojis,
			emojiPicked,
			setEmojiSuggestion,
			setIsEmojiListShowed,
			isEmojiListShowed,
			textToSearchEmojiSuggestion,
			setTextToSearchEmojiSuggesion,
			emojiListPNG,
			setAddEmojiActionChatbox,
			addEmojiState,
			setShiftPressed,
			shiftPressedState,
		],
	);
}
