// eslint-disable-next-line @nx/enforce-module-boundaries
import { channelsActions, clansActions, getStoreAsync } from '@mezon/store-mobile';
import { STORAGE_CHANNEL_CURRENT_CACHE, STORAGE_CLAN_ID, STORAGE_DATA_CLAN_CHANNEL_CACHE } from '../../constant';
import { load, save } from '../storage';

type ClanChannelPair = {
	clanId: string;
	channelId: string;
};

export function getUpdateOrAddClanChannelCache(clanId: string, channelId: string) {
	const data = load(STORAGE_DATA_CLAN_CHANNEL_CACHE) || [];
	const result = [...data];
	const pairIndex = data.findIndex((pair: ClanChannelPair) => pair.clanId === clanId);

	if (pairIndex !== -1) {
		// If a pair with the given clanId is found, update its channelId
		result[pairIndex].channelId = channelId;
	} else {
		// If no pair is found, add a new one
		result.push({ clanId, channelId });
	}

	return result;
}

export function getInfoChannelByClanId(data: ClanChannelPair[], clanId: string) {
	const pairIndex = data.findIndex((pair: ClanChannelPair) => pair.clanId === clanId);
	return pairIndex !== -1 ? data[pairIndex] : null;
}

export const setCurrentClanLoader = async (clans: any) => {
	const lastClanId = clans?.[clans?.length - 1]?.clan_id;
	const store = await getStoreAsync();
	if (lastClanId) {
		save(STORAGE_CLAN_ID, lastClanId);
		await store.dispatch(clansActions.joinClan({ clanId: '0' }));
		await store.dispatch(clansActions.joinClan({ clanId: lastClanId }));
		await store.dispatch(clansActions.changeCurrentClan({ clanId: lastClanId }));
		const respChannel = await store.dispatch(channelsActions.fetchChannels({ clanId: lastClanId, noCache: true }));
		await setDefaultChannelLoader(respChannel.payload, lastClanId);
	}
	return null;
};

export const setDefaultChannelLoader = async (dataChannel: any, clanId: string) => {
	const data = load(STORAGE_DATA_CLAN_CHANNEL_CACHE);
	const infoChannelCache = getInfoChannelByClanId(data || [], clanId);
	if (infoChannelCache?.channelId && infoChannelCache?.clanId) {
		await jumpToChannel(infoChannelCache.channelId, infoChannelCache.clanId);
	} else {
		const firstChannelId = dataChannel?.[0]?.channel_id;
		const firstClanId = dataChannel?.[0]?.clan_id;
		if (firstChannelId && firstClanId) {
			const dataSave = getUpdateOrAddClanChannelCache(firstClanId, firstChannelId);
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
			await jumpToChannel(firstChannelId, firstClanId);
		}
	}
};

export const jumpToChannel = async (channelId: string, clanId: string) => {
	if (channelId && clanId) {
		const store = await getStoreAsync();
		const channelsCache = load(STORAGE_CHANNEL_CURRENT_CACHE) || [];
		if (!channelsCache?.includes(channelId)) {
			save(STORAGE_CHANNEL_CURRENT_CACHE, [...channelsCache, channelId]);
		}
		store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
	}
};
