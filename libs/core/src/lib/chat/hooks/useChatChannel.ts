import { ChannelStreamMode } from 'mezon-js';
import { useMemo } from 'react';
import { useChannelMembers } from './useChannelMembers';
import { useThreads } from './useThreads';

export function useChatChannel(channelId: string) {
	const { threads } = useThreads();

	const { membersOfChild } = useChannelMembers({ channelId, mode: ChannelStreamMode.STREAM_MODE_CHANNEL });

	return useMemo(
		() => ({
			membersOfChild,
			threads
		}),
		[membersOfChild, threads]
	);
}
