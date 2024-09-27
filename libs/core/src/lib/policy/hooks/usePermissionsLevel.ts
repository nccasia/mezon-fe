import { EPermission } from '@mezon/utils';
import { useRef } from 'react';

const PERMISSIONS_LEVEL: Record<EPermission, number> = {
	[EPermission.administrator]: 4,
	[EPermission.manageClan]: 3,
	[EPermission.viewChannel]: 2,
	[EPermission.manageChannel]: 2,
	[EPermission.sendMessage]: 1,
	[EPermission.deleteMessage]: 1,
	[EPermission.manageThread]: 1
};

export const usePermissionsLevel = () => {
	const permissionLevel = useRef<Record<EPermission, number>>(PERMISSIONS_LEVEL);
	return permissionLevel.current;
};
