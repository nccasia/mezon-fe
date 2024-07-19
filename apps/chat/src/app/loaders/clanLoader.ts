import { clansActions, directActions, emojiSuggestionActions } from '@mezon/store';
import { ShouldRevalidateFunction } from 'react-router-dom';
import { CustomLoaderFunction } from './appLoader';

export type ClanLoaderData = {
	clanId: string;
};

export const clanLoader: CustomLoaderFunction = async ({ params, dispatch }) => {
	const { clanId } = params;
	if (!clanId) {
		throw new Error('Clan ID null');
	}
	dispatch(emojiSuggestionActions.fetchEmoji({ clanId: clanId, noCache: true }));
	dispatch(directActions.fetchDirectMessage({ noCache: true }));
	dispatch(clansActions.joinClan({ clanId }));
	dispatch(clansActions.changeCurrentClan({ clanId: clanId }));
	return {
		clanId,
	} as ClanLoaderData;
};

export const shouldRevalidateServer: ShouldRevalidateFunction = (ctx) => {
	const { currentParams, nextParams } = ctx;
	const { clanId: currentServerId } = currentParams;
	const { clanId: nextServerId } = nextParams;
	return currentServerId !== nextServerId;
};
