import { selectUserMaxPermissionLevel } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIsClanOwner } from './useIsClanOwner';
import { usePermissionsLevel } from './usePermissionsLevel';

export function useUserPermission() {
	const isClanOwner = useIsClanOwner();
	const maxPermissionLevel = useSelector(selectUserMaxPermissionLevel);
	const permissionLevel = usePermissionsLevel();

	const isAllowed = useCallback(
		(permission: EPermission) => {
			if (isClanOwner) {
				return true;
			}
			const isInteger = Number.isInteger(permissionLevel?.[permission]) && Number.isInteger(maxPermissionLevel);
			return isInteger && (maxPermissionLevel as number) >= permissionLevel?.[permission];
		},
		[isClanOwner, maxPermissionLevel, permissionLevel]
	);

	const userPermissionsStatus = useMemo(() => {
		return {
			hasAdministrator: isAllowed(EPermission.administrator),
			hasDeleteMessage: isAllowed(EPermission.deleteMessage),
			hasManageChannel: isAllowed(EPermission.manageChannel),
			hasManageClan: isAllowed(EPermission.manageClan),
			hasManageThread: isAllowed(EPermission.manageThread),
			hasSendMessage: isAllowed(EPermission.sendMessage),
			hasViewChannel: isAllowed(EPermission.viewChannel)
		};
	}, [isAllowed]);

	const composedActions = useMemo(() => {
		const { hasManageClan, hasManageThread, hasManageChannel, hasViewChannel, hasDeleteMessage, hasSendMessage } = userPermissionsStatus;

		return {
			isCanManageThread: hasManageThread,
			isCanManageChannel: hasManageChannel,
			isCanManageClan: hasManageClan,
			isCanDeleteMessage: hasDeleteMessage,
			isCanSendMessage: hasSendMessage,
			isCanViewChannel: hasViewChannel,
			isCanManageEvent: hasManageClan,
			isCanEditRole: hasManageClan
		};
	}, [userPermissionsStatus]);

	return {
		userPermissionsStatus,
		// @deprecated
		// TODO: remove
		isClanOwner,
		maxPermissionLevel,
		...composedActions
	};
}
