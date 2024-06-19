import { useClans, useRoles, useUserPolicy } from '@mezon/core';
import {
	getNewNameRole,
	getNewSelectedPermissions,
	getSelectedRoleId,
	setAddPermissions,
	setRemovePermissions,
	setSelectedPermissions,
	toggleIsShowFalse,
	toggleIsShowTrue,
} from '@mezon/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export type ModalSettingSave = {
	flagOption: boolean;
	handleClose: () => void;
	handlSaveClose: () => void;
	handleUpdateUser: () => void;
};
const SettingPermissions = () => {
	const dispatch = useDispatch();
	const { RolesClan } = useRoles();
	const { currentClan } = useClans();
	const { permissionsDefault } = useUserPolicy(currentClan?.id || '');
	const clickRole = useSelector(getSelectedRoleId);
	const [searchTerm, setSearchTerm] = useState('');
	const selectedPermissions = useSelector(getNewSelectedPermissions);
	const nameRole = useSelector(getNewNameRole);

	const activeRole = RolesClan.find((role) => role.id === clickRole);
	const permissionsRole = activeRole?.permission_list;
	const permissions = permissionsRole?.permissions?.filter((permission) => permission.active === 1) || [];
	const permissionIds = permissions.map((permission) => permission.id) || [];

	const [searchResults, setSearchResults] = useState<any[]>([]);

	useEffect(() => {
		const results = permissionsDefault.filter((permission) => permission.slug?.toLowerCase().includes(searchTerm.toLowerCase()));
		setSearchResults(results);
	}, [searchTerm, permissionsDefault]);

	const handlePermissionToggle = (permissionId: string) => {
		const isSelected = selectedPermissions.includes(permissionId);
		const newPermissions = isSelected ? selectedPermissions.filter((id) => id !== permissionId) : [...selectedPermissions, permissionId];
		dispatch(setSelectedPermissions(newPermissions));

		const newActivePermissionIds = newPermissions.filter((permissionId) => !permissionIds.includes(permissionId));
		const newRemovePermissionIds = permissionIds.filter((id) => id !== undefined && !newPermissions.includes(id));
		dispatch(setAddPermissions(newActivePermissionIds));
		dispatch(setRemovePermissions(newRemovePermissionIds));
	};

	useEffect(() => {
		const isSamePermissions =
			selectedPermissions.length === permissionIds.length && selectedPermissions.every((id) => permissionIds.includes(id));

		if (nameRole !== activeRole?.title || !isSamePermissions) {
			dispatch(toggleIsShowTrue());
		} else {
			dispatch(toggleIsShowFalse());
		}
	}, [nameRole, selectedPermissions, activeRole]);

	return (
		<>
			<div className="w-full flex">
				<input
					className="flex-grow dark:bg-black bg-white p-[7px] border rounded-lg"
					type="text"
					placeholder="Search Permissions"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>
			<br />
			<div>
				<ul className="flex flex-col gap-y-[5px]">
					{searchResults.map((permission) => (
						<li key={permission.id} className="flex items-center justify-between">
							<span className="font-normal">{permission.title}</span>
							<label>
								<input
									type="checkbox"
									checked={selectedPermissions.includes(permission.id)}
									onChange={() => handlePermissionToggle(permission.id)}
									className="cursor-pointer"
								/>
							</label>
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

export default SettingPermissions;
