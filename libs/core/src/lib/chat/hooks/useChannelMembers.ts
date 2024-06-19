import {
	ChannelMembersEntity,
	channelMembersActions,
	clansActions,
	selectMemberByUserId,
	selectMemberStatus,
	selectMembersByChannelId,
	useAppDispatch,
} from '@mezon/store';
import { RemoveChannelUsers, RemoveClanUsers } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export type useChannelMembersOptions = {
	channelId?: string | null;
};

export function useChannelMembers({ channelId }: useChannelMembersOptions = {}) {
	const dispatch = useAppDispatch();
	const rawMembers = useSelector(selectMembersByChannelId(channelId));
	const onlineStatus = useSelector(selectMemberStatus);

	const { userId } = useAuth();
	const userProfile = useSelector(selectMemberByUserId(userId as string));

	const onlineMembers = useMemo(() => {
		const listMembers = rawMembers.filter((member) => member.user?.online === true && onlineStatus[member.user.id ?? ''] === true);

		const isProfile = listMembers.find((member) => member.user?.id === userProfile?.user?.id);

		if (userProfile && !isProfile) {
			listMembers.push(userProfile);
		}
		return listMembers;
	}, [onlineStatus, rawMembers, userProfile]);

	const offlineMembers = useMemo(() => {
		const listMembers = rawMembers.filter((member) => !onlineMembers.some((memberOnline) => member.user?.id === memberOnline.user?.id));
		return listMembers;
	}, [onlineMembers, rawMembers]);

	const members = useMemo(() => {
		if (!rawMembers) {
			return [];
		}
		const roles = [
			{
				id: '',
				title: '',
			},
		];

		return roles.map((role) => {
			const categoryChannels = rawMembers.filter(
				//   (member) => member && member?.role_id === role.id
				(member) => member,
			) as ChannelMembersEntity[];
			return {
				...role,
				users: categoryChannels,
			};
		});
	}, [rawMembers]);

	const removeMemberChannel = useCallback(
		async ({ channelId, userIds }: RemoveChannelUsers) => {
			await dispatch(channelMembersActions.removeMemberChannel({ channelId, userIds }));
		},
		[dispatch],
	);

	const removeMemberClan = useCallback(
		async ({ clanId, userIds }: RemoveClanUsers) => {
			await dispatch(clansActions.removeClanUsers({ clanId, userIds }));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			members,
			rawMembers,
			onlineMembers,
			offlineMembers,
			removeMemberChannel,
			removeMemberClan,
		}),
		[members, offlineMembers, onlineMembers, rawMembers, removeMemberChannel, removeMemberClan],
	);
}
