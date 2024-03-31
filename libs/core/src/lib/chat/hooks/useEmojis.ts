import { emojisAction, getEmojiListStatus, getIsFocusEditor, selectEmojiSuggestion, selectEmojisData, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useEmojis() {
	const emojis = useSelector(selectEmojisData);
	const statusEmojiList = useSelector(getEmojiListStatus);
	const emojiPicked = useSelector(selectEmojiSuggestion);
	const isFocusEditor = useSelector(getIsFocusEditor);

	const dispatch = useAppDispatch();

	const setEmojiSuggestion = useCallback(
		(emoji: string) => {
			dispatch(emojisAction.setEmojiPicked(emoji));
		},
		[dispatch],
	);

	const setisOpenEmojiState = useCallback(
		(isOpen: boolean) => {
			dispatch(emojisAction.setStatusEmojiList(isOpen));
		},
		[dispatch],
	);

	const setIsFocusEditorStatus = useCallback(
		(isFocus: boolean) => {
			dispatch(emojisAction.setIsFocusEditor(isFocus));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			emojis,
			emojiPicked,
			setEmojiSuggestion,
			setisOpenEmojiState,
			statusEmojiList,
			setIsFocusEditorStatus,
			isFocusEditor,
		}),
		[emojis, emojiPicked, setEmojiSuggestion, setisOpenEmojiState, statusEmojiList, setIsFocusEditorStatus, isFocusEditor],
	);
}
