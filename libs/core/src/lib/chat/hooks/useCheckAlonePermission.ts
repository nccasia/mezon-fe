import { selectCurrentClanId } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useUserPolicy } from '../../policy/hooks/useUserPolicy';

export function useCheckAlonePermission() {
	const currentClanId = useSelector(selectCurrentClanId);
	const { permissionKeys } = useUserPolicy(currentClanId || '');
	const isAlone = useMemo(() => {
		return permissionKeys.length <= 1;
	}, [permissionKeys.length]);

	return isAlone;
}
