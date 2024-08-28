import { selectCurrentClanId } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useUserPolicy } from './useUserPolicy';

export function useUserRestriction(restrictions: EPermission[]) {
	const currentClanId = useSelector(selectCurrentClanId);
	const { permissionKeys } = useUserPolicy(currentClanId || '');
	const isAllowed = useMemo(() => {
		if (!Array.isArray(restrictions)) {
			return true;
		}
		if (restrictions.length === 0) {
			return true;
		}
		return restrictions.every((restriction) => permissionKeys.includes(restriction));
	}, [permissionKeys, restrictions]);

	return isAllowed;
}
