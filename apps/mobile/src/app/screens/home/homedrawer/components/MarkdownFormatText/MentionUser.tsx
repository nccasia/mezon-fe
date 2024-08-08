import { load } from '@mezon/mobile-components';
import { ChannelMembersEntity, RolesClanEntity, UsersClanEntity } from '@mezon/store';
import { ChannelStreamMode } from 'mezon-js/client';

type IMentionUser = {
	tagName: string;
	tagUserId: string;
	mode: number;
	usersClan: any;
	usersInChannel: any;
  rolesInClan: RolesClanEntity[];
};
export const MentionUser = ({ tagName, tagUserId, mode, usersClan, usersInChannel, rolesInClan }: IMentionUser) => {
	const getUserMention = (mode: number, usersInChannel: ChannelMembersEntity[], usersClan: UsersClanEntity[]) => {
		if (mode === ChannelStreamMode.STREAM_MODE_DM || mode === ChannelStreamMode.STREAM_MODE_GROUP) {
			return usersInChannel?.find((channelUser) => channelUser?.user?.id === tagUserId);
		}

		return usersClan?.find((userClan) => userClan?.user?.id === tagUserId);
	};

	const userMention = getUserMention(mode, usersInChannel, usersClan);
	const { user } = userMention || {};
  const roleList = rolesInClan?.map((item) => ({
    roleId: item.id ?? '',
    roleName: item.title ?? '',
  }));

  const roleMentionUser = roleList?.find((role) => `@${role.roleName}` === tagName);
  if(roleMentionUser) {
    return `[@${roleMentionUser?.roleName}](@role${roleMentionUser?.roleId})`;
  }

	if (tagName === '@here') {
		return `[@here](@here)`;
	}
	if (user) {
		return userMention?.user ? `[${tagName}](@${user?.username})` : `@[${user?.username}](@${user?.username})`;
	}
};
