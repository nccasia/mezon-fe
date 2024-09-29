import { selectCurrentClan, selectDmGroupCurrent } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppParams } from '../../../app/hooks/useAppParams';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useUserRestriction } from './useUserRestriction';

export type ClanRestrictionReturnType = [boolean, { isClanOwner: boolean; isOwnerGroupDM: boolean }];

/**
 * @deprecated will be removed
 */
export function useClanRestriction(restrictions: EPermission[]): ClanRestrictionReturnType {
	const currentClan = useSelector(selectCurrentClan);
	const { directId } = useAppParams();
	const currentGroupDM = useSelector(selectDmGroupCurrent(directId as string));
	const { userProfile } = useAuth();
	const isAllowed = useUserRestriction(restrictions);

	const isClanOwner = useMemo(() => {
		return currentClan?.creator_id === userProfile?.user?.id;
	}, [currentClan, userProfile]);

	const isOwnerGroupDM = useMemo(() => {
		return currentGroupDM?.creator_id === userProfile?.user?.id;
	}, [currentGroupDM?.creator_id, userProfile?.user?.id]);

	return [isAllowed, { isClanOwner, isOwnerGroupDM }] as ClanRestrictionReturnType;
}
