import { EPermission } from '@mezon/utils';
import { useClanRestriction } from './useClanRestriction';

export function useUserPermission() {
	const [hasAdministrator, { isClanOwner }] = useClanRestriction([EPermission.administrator]);
	const [hasDeleteMessage] = useClanRestriction([EPermission.deleteMessage]);
	const [hasManageChannel] = useClanRestriction([EPermission.manageChannel]);
	const [hasManageClan] = useClanRestriction([EPermission.manageClan]);
	const [hasManageThread] = useClanRestriction([EPermission.manageThread]);
	const [hasSendMessage] = useClanRestriction([EPermission.sendMessage]);
	const [hasViewChannel] = useClanRestriction([EPermission.viewChannel]);

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
