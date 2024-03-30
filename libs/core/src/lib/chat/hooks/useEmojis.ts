import { emojisAction, selectEmojisData, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useEmojis() {
	const emojis = useSelector(selectEmojisData);
	const dispatch = useAppDispatch();

	const setEmojiSuggestion = useCallback(
		(emoji: string) => {
			dispatch(emojisAction.setEmojiPicked(emoji));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			emojis,
			setEmojiSuggestion,
		}),
		[emojis, setEmojiSuggestion],
	);
}
