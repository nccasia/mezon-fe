// import {
// 	useAppDispatch
// } from '@mezon/store';
// import { useMezon } from '@mezon/transport';
import { useMemo } from 'react';
import { useChannelMembers } from './useChannelMembers';
import { useThreads } from './useThreads';

export function useChatChannel(channelId: string) {
	// const { clientRef } = useMezon();
	const { threads } = useThreads();

	const { members } = useChannelMembers({ channelId });

	// const client = clientRef.current;
	// const dispatch = useAppDispatch();

	return useMemo(
		() => ({
			members,
			threads,
		}),
		[members, threads],
	);
}
