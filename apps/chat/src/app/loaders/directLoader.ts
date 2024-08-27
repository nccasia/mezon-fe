import {channelsActions, emojiSuggestionActions} from '@mezon/store';
import { CustomLoaderFunction } from './appLoader';
import {ModeResponsive} from "@mezon/utils";

export const directLoader: CustomLoaderFunction = async ({ dispatch }) => {
	dispatch(emojiSuggestionActions.fetchEmoji({ clanId: '0', noCache: true }));
	dispatch(channelsActions.setModeResponsive(ModeResponsive.MODE_DM));
	return null;
};
