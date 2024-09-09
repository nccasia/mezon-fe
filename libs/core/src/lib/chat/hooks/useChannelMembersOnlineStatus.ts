import { ChannelsEntity, selectAllUserClans, selectChannelById, selectMemberIdsByChannelId, useAppSelector } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export type UseChannelMembersOnlineStatusOptions = {
	channel?: ChannelsEntity | null;
};

export function useChannelMembersOnlineStatus({ channel }: UseChannelMembersOnlineStatusOptions = {}) {
	const parrentChannel = useAppSelector(selectChannelById(channel?.parrent_id as string));
	const listMemberIds = useAppSelector((state) => selectMemberIdsByChannelId(channel?.id as string)(state));
	const usersClan = useSelector(selectAllUserClans);

	const rawMembers =
		channel?.channel_private || parrentChannel?.channel_private ? usersClan.filter((item) => listMemberIds.includes(item.id)) : usersClan;
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
