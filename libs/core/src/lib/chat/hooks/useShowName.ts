import { getNameForPrioritize } from '@mezon/utils';
import { useMemo } from 'react';

const useShowName = (clanNickname: string, displayName: string, username: string, senderId: string) => {
	const NX_CHAT_APP_ANNONYMOUS_USER_ID = process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID || 'anonymous';

	const checkAnonymous = useMemo(() => senderId === NX_CHAT_APP_ANNONYMOUS_USER_ID, [senderId]);

	const checkName = useMemo(() => {
		if (checkAnonymous) return 'Anonymous';
		return getNameForPrioritize(clanNickname, displayName, username);
	}, [checkAnonymous, clanNickname, displayName, username]);

	return checkName;
};

export default useShowName;
