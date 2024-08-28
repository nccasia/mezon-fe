import { useMemo } from 'react';
import { useMemberStatus } from '../../auth/hooks/useMemberStatus';

export function useChatUser(userId: string) {
	const isOnline = useMemberStatus(userId);

	return useMemo(
		() => ({
			isOnline
		}),
		[isOnline]
	);
}
