import { selectMembersByChannelId } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export type UseChannelMembersOnlineStatusOptions = {
	channelId?: string | null;
};

export function useChannelMembersOnlineStatus({ channelId }: UseChannelMembersOnlineStatusOptions = {}) {
	const rawMembers = useSelector(selectMembersByChannelId(channelId as string));
	const { userId } = useAuth();

	const [onlineMembers, offlineMembers] = useMemo(() => {
		const onlineList = [];
		const offlineList = [];

		for (const member of rawMembers) {
			if (member.user?.online === true) {
				onlineList.push(member);
			} else if (member.user?.id === userId) {
				onlineList.push(member);
			} else {
				offlineList.push(member);
			}
		}
		return [onlineList, offlineList];
	}, [rawMembers, userId]);

	return useMemo(
		() => ({
			onlineMembers,
			offlineMembers
		}),
		[offlineMembers, onlineMembers]
	);
}
