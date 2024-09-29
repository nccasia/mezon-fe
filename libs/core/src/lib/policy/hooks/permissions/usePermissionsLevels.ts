import { selectAllPermissionsDefault } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const usePermissionsLevel = () => {
	const permissionDefault = useSelector(selectAllPermissionsDefault);
	return useMemo(() => {
		return permissionDefault.reduce(
			(acc, perm) => {
				if (perm.slug) {
					acc[perm.slug as EPermission] = Number(perm.level);
				}
				return acc;
			},
			{} as Record<EPermission, number>
		);
	}, [permissionDefault]);
};
