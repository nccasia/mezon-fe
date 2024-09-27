import { selectCurrentClan } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export const useIsClanOwner = () => {
	const currentClan = useSelector(selectCurrentClan);
	const { userProfile } = useAuth();

	const isClanOwner = useMemo(() => {
		return currentClan?.creator_id === userProfile?.user?.id;
	}, [currentClan, userProfile]);
	return isClanOwner;
};
