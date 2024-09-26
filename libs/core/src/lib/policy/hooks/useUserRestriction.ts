import { selectCurrentClanId } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { usePermissionsLevel } from './usePermissionsLevel';
import { useUserPolicy } from './useUserPolicy';

export function useUserRestriction(restrictions: EPermission[]) {
	const currentClanId = useSelector(selectCurrentClanId);
	const { maxPermissionLevel } = useUserPolicy(currentClanId || '');
	const permissionLevel = usePermissionsLevel();
	const isAllowed = useMemo(() => {
		if (!restrictions?.length) {
			return true;
		}
		if (Number.isNaN(maxPermissionLevel)) {
			return false;
		}
		return restrictions.every((restriction) => permissionLevel[restriction] >= Number(maxPermissionLevel));
	}, [maxPermissionLevel, permissionLevel, restrictions]);

	return isAllowed;
}
