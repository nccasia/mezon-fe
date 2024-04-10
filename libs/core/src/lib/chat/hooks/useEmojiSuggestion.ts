import {
	emojiSuggestionActions,
	selectAllEmojiSuggestion,
	selectEmojiListStatus,
	selectEmojiSuggestion,
	selectEmotionconsData,
	selectKeyCodeFromKeyBoardState,
	selectPressAnyButtonState,
	selectTextToSearchEmojiSuggestion,
	useAppDispatch,
} from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useEmojiSuggestion() {
	const emojis = useSelector(selectAllEmojiSuggestion)[1];
	const isEmojiListShowed = useSelector(selectEmojiListStatus);
	const emojiPicked = useSelector(selectEmojiSuggestion);
	const keyCodeFromKeyBoard = useSelector(selectKeyCodeFromKeyBoardState);
	const textToSearchEmojiSuggestion = useSelector(selectTextToSearchEmojiSuggestion);
	const pressAnyButtonState = useSelector(selectPressAnyButtonState);
	const emotionconsData = useSelector(selectEmotionconsData).emoticons;

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

	const setKeyCodeFromKeyBoardState = useCallback(
		(keyCode: number) => {
			dispatch(emojiSuggestionActions.setKeyCodeFromKeyBoardState(keyCode));
		},
		[dispatch],
	);

	const setKeyboardPressAnyButtonStatus = useCallback(
		(isPress: boolean) => {
			dispatch(emojiSuggestionActions.setKeyboardPressAnyButtonStatus(isPress));
		},
		[dispatch],
	);

	const setTextToSearchEmojiSuggesion = useCallback(
		(textSearch: string) => {
			dispatch(emojiSuggestionActions.setTextToSearchEmojiSuggestion(textSearch));
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
			setKeyCodeFromKeyBoardState,
			keyCodeFromKeyBoard,
			textToSearchEmojiSuggestion,
			setTextToSearchEmojiSuggesion,
			setKeyboardPressAnyButtonStatus,
			pressAnyButtonState,
			emotionconsData
		}),
		[
			emojis,
			emojiPicked,
			setEmojiSuggestion,
			setIsEmojiListShowed,
			isEmojiListShowed,
			setKeyCodeFromKeyBoardState,
			keyCodeFromKeyBoard,
			textToSearchEmojiSuggestion,
			setTextToSearchEmojiSuggesion,
			setKeyboardPressAnyButtonStatus,
			pressAnyButtonState,
			emotionconsData
		],
	);
}
