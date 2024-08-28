import { selectCurrentClan } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useCheckOwnerForUser() {
	const currentClan = useSelector(selectCurrentClan);

	const checkClanOwner = useCallback((userId: string) => currentClan?.creator_id === userId, [currentClan?.creator_id]);

	return useMemo(() => [checkClanOwner], [checkClanOwner]);
}
