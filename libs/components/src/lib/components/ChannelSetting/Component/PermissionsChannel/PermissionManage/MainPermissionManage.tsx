import {
	permissionRoleChannelActions,
	RolesClanEntity,
	selectAllPermissionRoleChannel,
	selectAllRolesClan,
	selectAllUsesClan,
	selectRolesByChannelId,
	useAppDispatch
} from '@mezon/store';
import { EPermissionId, EVERYONE_ROLE_ID, EVERYONE_ROLE_TITLE } from '@mezon/utils';
import { ApiPermissionUpdate } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { TypeChoose } from './ItemPermission';
import ListPermission, { ListPermissionHandle } from './ListPermission';
import ListRoleMember from './ListRoleMember';

type MainPermissionManageProps = {
	channelId: string;
	setIsPrivateChannel: React.Dispatch<React.SetStateAction<boolean>>;
	setPermissionsListHasChanged: React.Dispatch<React.SetStateAction<boolean>>;
	saveTriggerRef: React.MutableRefObject<(() => void) | null>;
	resetTriggerRef: React.MutableRefObject<(() => void) | null>;
};

const MainPermissionManage: React.FC<MainPermissionManageProps> = ({
	channelId,
	setIsPrivateChannel,
	setPermissionsListHasChanged,
	saveTriggerRef,
	resetTriggerRef
}) => {
	const [permissions, setPermissions] = useState<{ [key: string]: number }>({});
	const permissionsLength = useMemo(() => {
		return Object.keys(permissions).length;
	}, [permissions]);
	const [currentRoleId, setCurrentRoleId] = useState<string>(EVERYONE_ROLE_ID);
	const listPermissionRoleChannel = useSelector(selectAllPermissionRoleChannel);
	const rolesClan = useSelector(selectAllRolesClan);
	const rolesInChannel = useSelector(selectRolesByChannelId(channelId));
	const [listRole, setListRole] = useState<RolesClanEntity[]>([]);
	const dispatch = useAppDispatch();
	const rolesNotInChannel = useMemo(() => {
		const roleInChannelIds = new Set(rolesInChannel.map((roleInChannel) => roleInChannel.id));
		return rolesClan.filter((role) => !roleInChannelIds.has(role.id));
	}, [rolesClan, rolesInChannel]);
	const usersClan = useSelector(selectAllUsesClan);

	const listPermissionRef = useRef<ListPermissionHandle>(null);

	const handleSelect = useCallback(
		(id: string, option: number, active?: boolean) => {
			const matchingRoleChannel = listPermissionRoleChannel.find((roleChannel) => roleChannel.permission_id === id);

			if (id === EPermissionId.VIEW_CHANNEL && currentRoleId === EVERYONE_ROLE_ID) {
				setIsPrivateChannel(option === TypeChoose.Remove);
			}

			if (active !== undefined) {
				if (matchingRoleChannel && matchingRoleChannel.active === active) {
					if (permissions[id] !== undefined) {
						const { [id]: _, ...rest } = permissions;
						setPermissions(rest);
					}
					return;
				} else {
					setPermissions((prevPermissions) => ({
						...prevPermissions,
						[id]: option
					}));
				}
			} else {
				if (matchingRoleChannel) {
					setPermissions((prevPermissions) => ({
						...prevPermissions,
						[id]: option
					}));
				} else {
					const { [id]: _, ...rest } = permissions;
					setPermissions(rest);
				}
			}
		},
		[currentRoleId, listPermissionRoleChannel, permissions, setIsPrivateChannel]
	);

	const handleSelectRole = useCallback(
		(id: string) => {
			setCurrentRoleId(id);
		},
		[setCurrentRoleId]
	);

	const handleReset = () => {
		setPermissions({});
		listPermissionRef.current?.reset();
	};

	resetTriggerRef.current = handleReset;

	const handleSave = async (roleId: string, permissionsArray: ApiPermissionUpdate[]) => {
		setPermissions({});
		await dispatch(
			permissionRoleChannelActions.setPermissionRoleChannel({ channelId: channelId, roleId: roleId || '', permission: permissionsArray })
		);
	};

	useEffect(() => {
		const hasPermissionsListChanged = permissionsLength !== 0;
		setPermissionsListHasChanged(hasPermissionsListChanged);
	}, [permissions]);

	useEffect(() => {
		const permissionsArray: ApiPermissionUpdate[] = [];
		for (const permission_id in permissions) {
			permissionsArray.push({
				permission_id,
				type: permissions[permission_id]
			});
		}
		saveTriggerRef.current = async () => {
			await handleSave(currentRoleId || '', permissionsArray);
		};
	}, [permissions, currentRoleId]);

	useEffect(() => {
		const roleExists = listRole.some((role) => role.id === EVERYONE_ROLE_ID);
		if (!roleExists) {
			setListRole([{ id: EVERYONE_ROLE_ID, title: EVERYONE_ROLE_TITLE }, ...rolesInChannel]);
		}
	}, [rolesInChannel, listRole]);

	return (
		listRole.length > 0 && (
			<div className="flex mt-4 gap-x-4">
				<ListRoleMember
					listManageInChannel={listRole}
					listManageNotInChannel={rolesNotInChannel}
					usersClan={usersClan}
					channelId={channelId}
					onSelect={handleSelectRole}
					canChange={permissionsLength === 0}
				/>
				<ListPermission onSelect={handleSelect} ref={listPermissionRef} />
			</div>
		)
	);
};

export default MainPermissionManage;
