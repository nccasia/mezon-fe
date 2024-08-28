import { channelsActions, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';

export function useChangeChannelId() {
	const dispatch = useAppDispatch();

	const setIdChannelSelected = useCallback(
		(channelId: string, clanId: string) => {
			dispatch(
				channelsActions.setIdChannelSelected({
					clanId,
					channelId
				})
			);
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			setIdChannelSelected
		}),
		[setIdChannelSelected]
	);
}
