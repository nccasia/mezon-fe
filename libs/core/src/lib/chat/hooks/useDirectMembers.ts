import { ChannelMembersEntity, selectMembersByChannelId } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export type useDirectMembersOptions = {
	channelId?: string | null;
};

export function useDirectMembers({ channelId }: useDirectMembersOptions = {}) {
	const rawMembers = useSelector(selectMembersByChannelId(channelId));

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

	return {
		members,
	};
}
