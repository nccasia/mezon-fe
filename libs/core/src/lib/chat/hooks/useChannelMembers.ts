import { selectAllChannelMembers, selectChannelById, useAppSelector } from '@mezon/store';
import { ChannelStreamMode } from 'mezon-js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export type useChannelMembersOptions = {
	channelId?: string | null;
	mode: number;
};

export function useChannelMembers({ channelId, mode }: useChannelMembersOptions) {
	const channel = useSelector(selectChannelById(channelId ?? ''));
	const membersOfChild = useAppSelector((state) => (channelId ? selectAllChannelMembers(state, channelId as string) : null));

	const membersOfParent = useAppSelector((state) => (channel?.parrent_id ? selectAllChannelMembers(state, channel.parrent_id as string) : null));

	return useMemo(
		() => ({
			membersOfParent: mode === ChannelStreamMode.STREAM_MODE_CHANNEL && channel?.parrent_id !== '0' ? membersOfParent : membersOfChild,
			membersOfChild
		}),
		[membersOfChild, membersOfParent, mode]
	);
}
