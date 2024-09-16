import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useClanRestriction } from './useClanRestriction';

export function useUserPermission() {
	const [hasAdministrator, { isClanOwner }] = useClanRestriction([EPermission.administrator]);
	const [hasDeleteMessage] = useClanRestriction([EPermission.deleteMessage]);
	const [hasManageChannel] = useClanRestriction([EPermission.manageChannel]);
	const [hasManageClan] = useClanRestriction([EPermission.manageClan]);
	const [hasManageThread] = useClanRestriction([EPermission.manageThread]);
	const [hasSendMessage] = useClanRestriction([EPermission.sendMessage]);
	const [hasViewChannel] = useClanRestriction([EPermission.viewChannel]);

	const maxPermissionLevel = useMemo(() => {
		if (hasAdministrator) {
			return 1;
		}
		if (hasManageClan) {
			return 2;
		}
		return 3;
	}, [hasAdministrator, hasManageClan]);

	const userPermissionsStatus = {
		hasAdministrator,
		hasDeleteMessage,
		hasManageChannel,
		hasManageClan,
		hasManageThread,
		hasSendMessage,
		hasViewChannel
	};
	return {
		userPermissionsStatus,
		isClanOwner,
		maxPermissionLevel,
		isCanManageThread: hasManageThread || hasAdministrator || isClanOwner,
		isCanManageChannel: hasManageChannel || hasAdministrator || isClanOwner || hasManageClan,
		isCanManageClan: hasManageClan || hasAdministrator || isClanOwner,
		isCanDeleteMessage: hasDeleteMessage || hasAdministrator || isClanOwner,
		isCanSendMessage: hasSendMessage || hasAdministrator || isClanOwner || hasManageChannel || hasManageClan || hasManageThread,
		isCanViewChannel: hasSendMessage || hasViewChannel || hasAdministrator || isClanOwner || hasManageChannel || hasManageClan || hasManageThread,
		isCanManageEvent: isClanOwner || hasAdministrator || hasManageClan,
		isCanEditRole: isClanOwner || hasAdministrator || hasManageClan
	};
}
