import { selectCurrentChannelId, selectUserMaxPermissionLevel } from '@mezon/store';
import { EOverriddenPermission, EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { usePermissionChecker } from '../permissions/usePermissionChecker';
import { useIsClanOwner } from '../useIsClanOwner';

/**
 * @deprecated will be removed
 */
export function useUserPermission() {
	const isClanOwner = useIsClanOwner();
	const maxPermissionLevel = useSelector(selectUserMaxPermissionLevel);
	const currentChannelId = useSelector(selectCurrentChannelId);

	const [hasAdministrator, hasManageChannel, hasManageClan, hasViewChannel, hasManageThread, hasSendMessage, hasDeleteMessage] =
		usePermissionChecker(
			[
				EPermission.administrator,
				EPermission.manageChannel,
				EPermission.manageClan,
				EPermission.viewChannel,
				EOverriddenPermission.manageThread,
				EOverriddenPermission.sendMessage,
				EOverriddenPermission.deleteMessage
			],
			currentChannelId ?? ''
		);
	const userPermissionsStatus = useMemo(() => {
		return {
			hasAdministrator,
			hasDeleteMessage,
			hasManageChannel,
			hasManageClan,
			hasManageThread,
			hasSendMessage,
			hasViewChannel
		};
	}, [hasAdministrator, hasDeleteMessage, hasManageChannel, hasManageClan, hasManageThread, hasSendMessage, hasViewChannel]);

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
