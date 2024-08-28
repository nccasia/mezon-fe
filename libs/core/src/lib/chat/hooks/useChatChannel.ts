import { useMemo } from 'react';
import { useChannelMembers } from './useChannelMembers';
import { useThreads } from './useThreads';

export function useChatChannel(channelId: string) {
	const { threads } = useThreads();

	const { members } = useChannelMembers({ channelId });

	return useMemo(
		() => ({
			members,
			threads
		}),
		[members, threads]
	);
}
