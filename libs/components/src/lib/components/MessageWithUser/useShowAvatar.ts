import { useMemo } from 'react';

const useShowAvatar = (generalAvatar: string, clanAvatar: string) => {
	const avatarShowed = useMemo(() => {
		if (clanAvatar) return clanAvatar;
		if (generalAvatar) return generalAvatar;

		return null;
	}, [generalAvatar, clanAvatar]);

	return avatarShowed;
};

export default useShowAvatar;
