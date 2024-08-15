import { selectMemberById, selectMemberClanByUserId } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useShowName from './useShowName';

export const useGetPriorityNameFromUserClan = (senderId: string) => {
	const isAnonymous = useMemo(() => senderId === process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID, [senderId]);

	const userClan = useSelector(selectMemberClanByUserId(senderId));
	const userDR = useSelector(selectMemberById(senderId));

	const usernameSender = useMemo(() => {
		if (userDR) {
			return userDR?.user?.username;
		} else {
			return userClan?.user?.username;
		}
	}, [userClan?.user?.username, userDR]);

	const clanNick = useMemo(() => {
		return userClan?.clan_nick;
	}, [userClan?.clan_nick]);

	const displayName = useMemo(() => {
		if (userDR) {
			return userDR?.user?.display_name;
		} else {
			return userClan?.user?.display_name;
		}
	}, [userClan?.user?.display_name, userDR]);

	const clanAvatar = useMemo(() => {
		return userClan?.clan_avatar;
	}, [userClan?.clan_avatar]);

	const generalAvatar = useMemo(() => {
		if (userDR) {
			return userDR?.user?.avatar_url;
		} else {
			return userClan?.user?.avatar_url;
		}
	}, [userClan?.user?.avatar_url, userDR]);

	const namePriority = useShowName(clanNick ?? '', displayName ?? '', usernameSender ?? '', senderId);

	const priorityAvatar = useMemo(() => {
		return clanAvatar ? clanAvatar : generalAvatar;
	}, [clanAvatar, generalAvatar]);

	return {
		usernameSender,
		clanNick,
		displayName,
		clanAvatar,
		generalAvatar,
		namePriority,
		priorityAvatar,
		isAnonymous,
	};
};
