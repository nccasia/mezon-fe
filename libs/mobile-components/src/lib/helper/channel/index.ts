import { STORAGE_KEY_CLAN_CURRENT_CACHE } from '../../constant';
import { load } from '../storage';

type ClanChannelPair = {
	clanId: string;
	channelId: string;
};

export function getUpdateOrAddClanChannelCache(clanId: string, channelId: string) {
	const data = load(STORAGE_KEY_CLAN_CURRENT_CACHE) || [];
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
