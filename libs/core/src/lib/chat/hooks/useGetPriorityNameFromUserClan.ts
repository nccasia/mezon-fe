import { selectMemberById } from '@mezon/store';
import useShowName from 'libs/components/src/lib/components/MessageWithUser/useShowName';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useGetPriorityNameFromUserClan = (senderId: string) => {
	const isAnonymous = useMemo(() => senderId === process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID, [senderId]);

	const user = useSelector(selectMemberById(senderId));

	const usernameSender = useMemo(() => {
		return user?.user?.username;
	}, [user?.user?.username]);

	const clanNick = useMemo(() => {
		return user?.clan_nick;
	}, [user?.clan_nick]);

	const displayName = useMemo(() => {
		return user?.user?.display_name;
	}, [user?.user?.display_name]);

	const clanAvatar = useMemo(() => {
		return user?.clan_avatar;
	}, [user?.clan_avatar]);

	const generalAvatar = useMemo(() => {
		return user?.user?.avatar_url;
	}, [user?.user?.avatar_url]);

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
