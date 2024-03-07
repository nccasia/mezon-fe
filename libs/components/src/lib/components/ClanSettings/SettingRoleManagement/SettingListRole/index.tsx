import { useRoles } from '@mezon/core';
import { getIsShow, getSelectedRoleId, setAddMemberRoles, setNameRoleNew, setSelectedPermissions, setSelectedRoleId } from '@mezon/store';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
type closeEditRole = {
	handleClose: () => void;
};
const SettingListRole = (props: closeEditRole) => {
	const isChange = useSelector(getIsShow);

	const clickRole = useSelector(getSelectedRoleId);
	const [clickedRole, setClickedRole] = useState<null | string>(clickRole);
	const [nameRoleNew] = useState('New role');

	const dispatch = useDispatch();
	const { RolesClan } = useRoles();
	const handleRoleClick = (roleId: string) => {
		if (!isChange) {
			const activeRole = RolesClan.find((role) => role.id === roleId);
			const memberIDRoles = activeRole?.role_user_list?.role_users?.map((member) => member.id) || [];

			const permissionsRole = activeRole?.permission_list;
			const permissions = permissionsRole?.permissions?.filter((permission) => permission.active === 1) || [];
			const permissionIds = permissions.map((permission) => permission.id) || [];

			dispatch(setNameRoleNew(activeRole?.title));
			dispatch(setAddMemberRoles(memberIDRoles));
			dispatch(setSelectedPermissions(permissionIds));
			setClickedRole(roleId);
			dispatch(setSelectedRoleId(roleId));
		}
	};
	const activeRoles = RolesClan.filter((role) => role.active === 1);
	return (
		<div className="w-1/3 pr-3 flex flex-col">
			<div className="font-semibold mb-4">
				<div className="cursor-pointer tracking-wide" onClick={() => props.handleClose()}>
					BACK
				</div>
			</div>
			<div className="overflow-y-scroll flex flex-col gap-y-2">
				{clickedRole === 'New Role' ? (
					<div>
						<button
							className={`block w-full py-2 px-4 rounded ${
								clickedRole === 'New Role' ? 'bg-blue-700 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-700'
							} text-white font-bold`}
						>
							{nameRoleNew}
						</button>
					</div>
				) : (
					activeRoles.map((role) => (
						<div key={role.id}>
							<button
								onClick={() => handleRoleClick(role.id)}
								className={`w-full py-2 px-4 rounded ${
									clickedRole === role.id ? 'bg-blue-700 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-700'
								} text-white font-bold truncate`}
							>
								{role.title}
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default SettingListRole;
