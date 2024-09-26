import { selectCurrentClan } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePermissionsLevel } from './usePermissionsLevel';
import { useUserPolicy } from './useUserPolicy';

const useIsClanOwner = () => {
	const currentClan = useSelector(selectCurrentClan);
	const { userProfile } = useAuth();

	const isClanOwner = useMemo(() => {
		return currentClan?.creator_id === userProfile?.user?.id;
	}, [currentClan, userProfile]);
	return isClanOwner;
};

export function useUserPermission() {
	const currentClan = useSelector(selectCurrentClan);
	const isClanOwner = useIsClanOwner();
	const { maxPermissionLevel } = useUserPolicy(currentClan?.id ?? '');
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
		const { hasAdministrator, hasManageClan, hasManageThread, hasManageChannel, hasViewChannel, hasDeleteMessage, hasSendMessage } =
			userPermissionsStatus;
		const isClanOwnerOrAdmin = isClanOwner || hasAdministrator;

		return {
			isCanManageThread: isClanOwnerOrAdmin || hasManageThread,
			isCanManageChannel: isClanOwnerOrAdmin || hasManageThread || hasManageChannel,
			isCanManageClan: isClanOwnerOrAdmin || hasManageClan,
			isCanDeleteMessage: isClanOwnerOrAdmin || hasDeleteMessage,
			isCanSendMessage: isClanOwnerOrAdmin || hasSendMessage || hasManageChannel || hasManageClan || hasManageThread,
			isCanViewChannel: isClanOwnerOrAdmin || hasSendMessage || hasViewChannel || hasManageChannel || hasManageClan || hasManageThread,
			isCanManageEvent: isClanOwnerOrAdmin || hasManageClan,
			isCanEditRole: isClanOwnerOrAdmin || hasManageClan
		};
	}, [isClanOwner, userPermissionsStatus]);

	return {
		isClanOwner,
		userPermissionsStatus,
		maxPermissionLevel,
		...composedActions
	};
}
