import { useChannelMembers } from '@mezon/core';
import { ChannelMembersEntity } from '@mezon/store';
import { IMentionData } from '@mezon/utils';

function UserMentionList(channelID : string) {
	const { members } = useChannelMembers({ channelId : channelID });
	const userMentionRaw = members[0].users;
	const newUserMentionList: IMentionData[] = userMentionRaw?.map((item: ChannelMembersEntity) => ({
		avatar: item?.user?.avatar_url ?? '',
		name: item?.user?.username ?? '',
		id: item?.user?.id ?? '',
	}));
	return newUserMentionList;
}

export default UserMentionList;
