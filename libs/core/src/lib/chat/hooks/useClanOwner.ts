import { selectAllAccount, selectCurrentClan } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useClanOwner() {
	const currentClan = useSelector(selectCurrentClan);
	const userProfile = useSelector(selectAllAccount);

	const isClanOwner = useMemo(() => {
		return currentClan?.creator_id === userProfile?.user?.id;
	}, [currentClan, userProfile]);

	return isClanOwner;
}
