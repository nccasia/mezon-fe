import { selectCurrentChannelId, selectCurrentClanId } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useChatParams() {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);

	return useMemo(
		() => ({
			currentChannelId,
			currentClanId
		}),
		[currentChannelId, currentClanId]
	);
}
