import { selectMembersByChannelId } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export type useChannelMembersOptions = {
	channelId?: string | null;
};

export function useChannelMembers({ channelId }: useChannelMembersOptions = {}) {
	const members = useSelector(selectMembersByChannelId(channelId));

	return useMemo(
		() => ({
			members
		}),
		[members]
	);
}
