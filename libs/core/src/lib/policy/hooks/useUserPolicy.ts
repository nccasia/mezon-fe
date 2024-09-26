import {
	policiesActions,
	selectAllPermissionsDefault,
	selectAllPermissionsUser,
	selectAllPermissionsUserKey,
	selectUserMaxPermissionLevel,
	useAppDispatch
} from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export function useUserPolicy(clanId: string) {
	const dispatch = useAppDispatch();
	const { userId } = useAuth();
	const permissions = useSelector(selectAllPermissionsUser);
	const permissionsDefault = useSelector(selectAllPermissionsDefault);
	const permissionKeys = useSelector(selectAllPermissionsUserKey) as EPermission[];
	const maxPermissionLevel = useSelector(selectUserMaxPermissionLevel);

	const fetchPolicies = useCallback(() => {
		if (!clanId) return;

		dispatch(policiesActions.fetchPermissionsUser({ clanId }));
	}, [clanId, dispatch]);

	return useMemo(
		() => ({
			permissions,
			maxPermissionLevel,
			permissionKeys,
			userId,
			fetchPolicies,
			permissionsDefault
		}),
		[permissions, maxPermissionLevel, permissionKeys, userId, fetchPolicies, permissionsDefault]
	);
}
