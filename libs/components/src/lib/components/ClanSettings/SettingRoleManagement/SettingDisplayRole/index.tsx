import { useRoles } from '@mezon/core';
import { getNewNameRole, getNewSelectedPermissions, getSelectedRoleId, setNameRoleNew, toggleIsShowFalse, toggleIsShowTrue } from '@mezon/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export type ModalSettingSave = {
	flagOption: boolean;
	handleClose: () => void;
	handlSaveClose: () => void;
	handleUpdateUser: () => void;
};

const SettingDisplayRole = () => {
	const nameRole = useSelector(getNewNameRole);
	const selectedPermissions = useSelector(getNewSelectedPermissions);
	const { RolesClan } = useRoles();
	const clickRole = useSelector(getSelectedRoleId);

	const activeRole = RolesClan.find((role) => role.id === clickRole);
	const permissionsRole = activeRole?.permission_list;
	const permissions = permissionsRole?.permissions?.filter((permission) => permission.active === 1) || [];
	const permissionIds = permissions.map((permission) => permission.id) || [];

	const dispatch = useDispatch();

	const handleDisplayName = (event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(setNameRoleNew(event.target.value));
	};

	useEffect(() => {
		const isSamePermissions =
			selectedPermissions.length === permissionIds.length && selectedPermissions.every((id) => permissionIds.includes(id));

		if (nameRole !== activeRole?.title || !isSamePermissions) {
			dispatch(toggleIsShowTrue());
		} else {
			dispatch(toggleIsShowFalse());
		}
	}, [nameRole, selectedPermissions]);

	return (
		<div className="w-full flex flex-col gap-y-5">
			<div className="tracking-wide">Role name</div>
			<input className="bg-black w-full p-[7px] border rounded-lg " type="text" value={nameRole} onChange={handleDisplayName} />
		</div>
	);
};

export default SettingDisplayRole;
