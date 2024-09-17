import { channelsActions, emojiSuggestionActions } from '@mezon/store';
import { ModeResponsive } from '@mezon/utils';
import { CustomLoaderFunction } from './appLoader';

export const directLoader: CustomLoaderFunction = async ({ dispatch }) => {
	dispatch(emojiSuggestionActions.fetchEmoji());
	dispatch(channelsActions.setModeResponsive(ModeResponsive.MODE_DM));
	return null;
};
