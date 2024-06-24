import { clansActions, getStoreAsync } from '@mezon/store';
import { LoaderFunction, ShouldRevalidateFunction } from 'react-router-dom';

export type ClanLoaderData = {
	clanId: string;
};

export const clanLoader: LoaderFunction = async ({ params }) => {
	const { clanId } = params;
	const store = await getStoreAsync();
	if (!clanId) {
		throw new Error('Clan ID null');
	}
	store.dispatch(clansActions.joinClan({clanId}));
	store.dispatch(clansActions.changeCurrentClan({ clanId: clanId }));
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
