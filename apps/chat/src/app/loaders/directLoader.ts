import { emojiSuggestionActions } from '@mezon/store';
import { CustomLoaderFunction } from './appLoader';

export const directLoader: CustomLoaderFunction = async ({ dispatch }) => {
	dispatch(emojiSuggestionActions.fetchEmoji({ clanId: '0', noCache: true }));
	return null;
};
