import { policiesActions, selectAllPermissionsDefault, selectAllPermissionsUser, selectUserMaxPermissionLevel, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export function useUserPolicy(clanId: string) {
	const dispatch = useAppDispatch();
	const { userId } = useAuth();
	const permissions = useSelector(selectAllPermissionsUser);
	const permissionsDefault = useSelector(selectAllPermissionsDefault);
	const maxPermissionLevel = useSelector(selectUserMaxPermissionLevel);

	const fetchPolicies = useCallback(() => {
		if (!clanId) return;

		dispatch(policiesActions.fetchPermissionsUser({ clanId }));
	}, [clanId, dispatch]);

	return useMemo(
		() => ({
			userId,
			permissions,
			maxPermissionLevel,
			permissionsDefault,
			fetchPolicies
		}),
		[permissions, maxPermissionLevel, userId, fetchPolicies, permissionsDefault]
	);
}
