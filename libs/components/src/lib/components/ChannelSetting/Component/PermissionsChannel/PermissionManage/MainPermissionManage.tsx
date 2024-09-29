import { useMyRole } from '@mezon/core';
import {
	permissionRoleChannelActions,
	RolesClanEntity,
	selectAllPermissionRoleChannel,
	selectAllRolesClan,
	selectAllUserChannel,
	selectAllUserClans,
	selectPermissionChannel,
	selectRolesByChannelId,
	useAppDispatch
} from '@mezon/store';
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
	const [currentRoleId, setCurrentRoleId] = useState<{ id: string; type: number }>();
	const listPermission = useSelector(selectPermissionChannel);
	const listPermissionRoleChannel = useSelector(selectAllPermissionRoleChannel);
	const rolesClan = useSelector(selectAllRolesClan);
	const rolesInChannel = useSelector(selectRolesByChannelId(channelId));
	const rawMembers = useSelector(selectAllUserChannel);
	const combinedArray = [
		...rolesInChannel.map((role) => ({
			id: role.id,
			title: role.title,
			type: 0
		})),
		...rawMembers.map((member) => ({
			id: member.id,
			title: member.user?.username,
			type: 1
		}))
	];

	const { maxPermissionId } = useMyRole();
	const [listRole, setListRole] = useState<RolesClanEntity[]>([]);
	const dispatch = useAppDispatch();

	const rolesNotInChannel = useMemo(() => {
		const roleInChannelIds = new Set(rolesInChannel.map((roleInChannel) => roleInChannel.id));
		return rolesClan.filter((role) => !roleInChannelIds.has(role.id));
	}, [rolesClan, rolesInChannel]);
	const usersClan = useSelector(selectAllUserClans);

	const listPermissionRef = useRef<ListPermissionHandle>(null);

	const handleSelect = useCallback(
		(id: string, option: number, active?: boolean) => {
			const matchingRoleChannel = listPermissionRoleChannel.find((roleChannel) => roleChannel.permission_id === id);

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
		[listPermissionRoleChannel, permissions]
	);

	const handleSelectRole = useCallback(
		(id: string, type: number) => {
			setCurrentRoleId({ id: id, type: type });
		},
		[setCurrentRoleId]
	);

	const handleReset = () => {
		setPermissions({});
		listPermissionRef.current?.reset();
	};

	resetTriggerRef.current = handleReset;

	const handleSave = async (id: string, permissionsArray: ApiPermissionUpdate[], type: number) => {
		setPermissions({});
		const intersection = listPermission.filter((x) => {
			return !permissionsArray.some((y) => x.id === y.permission_id);
		});
		intersection.forEach((p) => {
			const matchingRoleChannel = listPermissionRoleChannel.find((roleChannel) => roleChannel.permission_id === p.id);
			permissionsArray.push({
				permission_id: p.id,
				slug: p.slug,
				type: matchingRoleChannel ? (matchingRoleChannel.active ? TypeChoose.Tick : TypeChoose.Remove) : TypeChoose.Or
			});
		});
		if (type === 0) {
			await dispatch(
				permissionRoleChannelActions.setPermissionRoleChannel({
					channelId: channelId,
					roleId: id || '',
					permission: permissionsArray,
					maxPermissionId: maxPermissionId,
					userId: ''
				})
			);
		} else {
			await dispatch(
				permissionRoleChannelActions.setPermissionRoleChannel({
					channelId: channelId,
					roleId: '',
					permission: permissionsArray,
					maxPermissionId: maxPermissionId,
					userId: id || ''
				})
			);
		}
	};

	useEffect(() => {
		const hasPermissionsListChanged = permissionsLength !== 0;
		setPermissionsListHasChanged(hasPermissionsListChanged);
	}, [permissions, permissionsLength, setPermissionsListHasChanged]);

	useEffect(() => {
		const permissionsArray: ApiPermissionUpdate[] = [];
		for (const permission_id in permissions) {
			permissionsArray.push({
				permission_id,
				type: permissions[permission_id],
				slug: listPermission.filter((p) => p.id === permission_id).at(0)?.slug
			});
		}
		saveTriggerRef.current = async () => {
			await handleSave(currentRoleId?.id || '', permissionsArray, currentRoleId?.type || 0);
		};
	}, [permissions, currentRoleId]);

	return (
		combinedArray.length > 0 && (
			<div className="flex mt-4 gap-x-4">
				<ListRoleMember
					listManageInChannel={combinedArray}
					listManageNotInChannel={rolesNotInChannel}
					usersClan={usersClan}
					channelId={channelId}
					onSelect={handleSelectRole}
					canChange={permissionsLength === 0}
				/>
				<ListPermission listPermission={listPermission} onSelect={handleSelect} ref={listPermissionRef} />
			</div>
		)
	);
};

export default MainPermissionManage;
