import { selectCurrentClan } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';
import { useUserRestriction } from './useUserRestriction';

export type ClanRestrictionReturnType = [boolean, { isClanOwner: boolean }];

export function useClanRestriction(restrictions: EPermission[]) :ClanRestrictionReturnType {
	const currentClan = useSelector(selectCurrentClan);
	const { userProfile } = useAuth();
	const isAllowed = useUserRestriction(restrictions)
	
	const isClanOwner = useMemo(() => {
		return currentClan?.creator_id === userProfile?.user?.id 
	}, [currentClan, userProfile]);
	
	return [isAllowed, {isClanOwner}] as ClanRestrictionReturnType;
}
