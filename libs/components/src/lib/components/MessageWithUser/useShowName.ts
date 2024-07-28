import { useMemo } from 'react';

const useShowName = (clanNickname: string, displayName: string, username: string, senderId: string) => {
	const NX_CHAT_APP_ANNONYMOUS_USER_ID = process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID || 'anonymous';
	const checkAnonymous = useMemo(() => senderId === NX_CHAT_APP_ANNONYMOUS_USER_ID, [senderId]);

	const nameShowed = useMemo(() => {
		if (checkAnonymous) return 'Anonymous';
		if (clanNickname && clanNickname !== username) return clanNickname;
		if ((clanNickname === username && displayName) || (!clanNickname && displayName)) return displayName;
		if (username) return username;
	}, [checkAnonymous, clanNickname, displayName, username]);
	return nameShowed;
};

export default useShowName;
