import { useChannelMembers } from '@mezon/core';
import { ID_MENTION_HERE } from '@mezon/mobile-components';
import { selectAllRolesClan } from '@mezon/store-mobile';
import { ChannelMembersEntity, MentionDataProps } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiRole } from 'mezon-js/api.gen';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

function UseMentionList(channelID: string, channelMode?: number): MentionDataProps[] {
	const { membersOfParent: members } = useChannelMembers({ channelId: channelID, mode: channelMode });
	const rolesInClan = useSelector(selectAllRolesClan);
	const { t } = useTranslation('clanRoles');

	const newUserMentionList = useMemo(() => {
		if (!members || members.length === 0) {
			return [];
		}

		const userMentionRaw = members;
		const mentionList =
			userMentionRaw?.map((item: ChannelMembersEntity) => {
				return {
					...item,
					id: item?.user?.id ?? '',
					display: item?.clan_nick || item?.user?.display_name || item?.user?.username || '',
					avatarUrl: item?.user?.avatar_url ?? '',
					username: item?.user?.username
				};
			}) ?? [];
		const hardcodedUser = {
			id: ID_MENTION_HERE,
			display: 'here',
			avatarUrl: '',
			user: {
				id: ID_MENTION_HERE,
				display_name: 'here',
				username: 'here',
				avatarUrl: ''
			},
			username: t('notifyEveryone')
		};
		const sortedMentionList = [...mentionList].sort((a, b) => {
			const displayA = a.display?.toLowerCase() || '';
			const displayB = b.display?.toLowerCase() || '';

			if (displayA < displayB) return -1;
			if (displayA > displayB) return 1;
			return 0;
		});

		const roleMentions =
			rolesInClan?.map((item: ApiRole) => ({
				id: item.id ?? '',
				display: item.title,
				avatarUrl: '',
				clanNick: item.title,
				isRoleUser: true
			})) ?? [];

		if (channelMode === ChannelStreamMode.STREAM_MODE_CHANNEL) {
			return [...sortedMentionList, ...roleMentions, hardcodedUser];
		} else {
			return [...sortedMentionList];
		}
	}, [members, rolesInClan, channelMode]);

	return newUserMentionList;
}

export default UseMentionList;
