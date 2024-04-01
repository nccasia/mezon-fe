import {
	emojiActions,
	getEmojiListStatus,
	getIsFocusEditor,
	getTextToSearchEmojiSuggestion,
	selectAllEmoji,
	selectEmojiSuggestion,
	useAppDispatch,
} from '@mezon/store';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

export function useEmojis() {
	const emojis = useSelector(selectAllEmoji)[1];
	const categoryEmoji = useSelector(selectAllEmoji)[0]
	const isEmojiListShowed = useSelector(getEmojiListStatus);
	const emojiPicked = useSelector(selectEmojiSuggestion);
	const isFocusEditor = useSelector(getIsFocusEditor);
	const textToSearchEmojiSuggestion = useSelector(getTextToSearchEmojiSuggestion);

	const dispatch = useAppDispatch();

	const setEmojiSuggestion = useCallback(
		(emoji: string) => {
			dispatch(emojiActions.setEmojiPicked(emoji));
		},
		[dispatch],
	);

	const setIsEmojiListShowed = useCallback(
		(isOpen: boolean) => {
			dispatch(emojiActions.setStatusEmojiList(isOpen));
		},
		[dispatch],
	);

	const setIsFocusEditorStatus = useCallback(
		(isFocus: boolean) => {
			dispatch(emojiActions.setIsFocusEditor(isFocus));
		},
		[dispatch],
	);

	const setTextToSearchEmojiSuggesion = useCallback(
		(textSearch: string) => {
			dispatch(emojiActions.setTextToSearchEmojiSuggestion(textSearch));
		},
		[dispatch],
	);

	return {
		emojis,
		categoryEmoji,
		emojiPicked,
		setEmojiSuggestion,
		setIsEmojiListShowed,
		isEmojiListShowed,
		setIsFocusEditorStatus,
		isFocusEditor,
		textToSearchEmojiSuggestion,
		setTextToSearchEmojiSuggesion,

	};
}
