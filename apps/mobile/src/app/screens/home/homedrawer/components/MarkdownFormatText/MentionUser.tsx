import { load } from '@mezon/mobile-components';
import { ChannelMembersEntity, UsersClanEntity } from '@mezon/store';
import { ChannelStreamMode } from 'mezon-js/client';

type IMentionUser = {
	tagName: string;
	tagUserId: string;
	mode: number;
	usersClan: any;
	usersInChannel: any;
	clansProfile: any;
};
export const MentionUser = ({ tagName, tagUserId, mode, usersClan, usersInChannel, clansProfile }: IMentionUser) => {
	const currentClanId = load('persist:clans').currentClanId;

	const getUserMention = (mode: number, usersInChannel: ChannelMembersEntity[], usersClan: UsersClanEntity[]) => {
		if (mode === ChannelStreamMode.STREAM_MODE_DM || mode === ChannelStreamMode.STREAM_MODE_GROUP) {
			return usersInChannel?.find((channelUser) => channelUser?.user?.id === tagUserId);
		}

		return usersClan?.find((userClan) => userClan?.user?.id === tagUserId);
	};

	const userMention = getUserMention(mode, usersInChannel, usersClan);
	const { user } = userMention || {};

	const clanProfileByIdUser = clansProfile?.find((clanProfile) => clanProfile?.clan_id === currentClanId && clanProfile?.user_id === user?.id);

	if (tagName === '@here') {
		return `[@here](@here)`;
	}

	if (clanProfileByIdUser) {
		return `[@${clanProfileByIdUser?.nick_name}](@${user?.username})`;
	}

	if (userMention) {
		return user?.display_name ? `[@${user?.display_name}](@${user?.username})` : `@[${user?.username}](@${user?.username})`;
	}
};
