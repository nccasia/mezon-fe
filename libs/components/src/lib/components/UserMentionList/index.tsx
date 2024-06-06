import { useChannelMembers } from '@mezon/core';
import { ChannelMembersEntity } from '@mezon/store';
import { MentionDataProps } from '@mezon/utils';
import { useMemo } from 'react';

function UserMentionList(channelID: string): MentionDataProps[] {
	const { members } = useChannelMembers({ channelId: channelID });

	const newUserMentionList = useMemo(() => {
		if (!members || members.length === 0) {
			return [];
		}

		const userMentionRaw = members[0].users;
		const mentionList =
			userMentionRaw?.map((item: ChannelMembersEntity) => ({
				id: item?.user?.id ?? '',
				display: item?.user?.username ?? '',
				avatarUrl: item?.user?.avatar_url ?? '',
			})) ?? [];
		const hardcodedUser: MentionDataProps = {
			id: '1775731111020111321',
			display: 'here',
			avatarUrl: '',
		};
		const sortedMentionList = [...mentionList].sort((a, b) => {
			if (a.display.toLowerCase() < b.display.toLowerCase()) return -1;
			if (a.display.toLowerCase() > b.display.toLowerCase()) return 1;
			return 0;
		});
		return [...sortedMentionList, hardcodedUser];
	}, [members]);

	return newUserMentionList;
}

export default UserMentionList;
