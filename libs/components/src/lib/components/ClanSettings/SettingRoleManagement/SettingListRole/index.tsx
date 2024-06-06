import { useApp, useRoles } from '@mezon/core';
import { getIsShow, getSelectedRoleId, setAddMemberRoles, setNameRoleNew, setSelectedPermissions, setSelectedRoleId } from '@mezon/store';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../../../Icons';
type closeEditRole = {
	handleClose: () => void;
};
const SettingListRole = (props: closeEditRole) => {
	const {appearanceTheme} = useApp();
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
			<div className="font-semibold mb-4 flex">
				<div className="rotate-90 -ml-[10px] dark:text-textDarkTheme text-textLightTheme">
					<Icons.ArrowDown defaultSize="size-5" />
				</div>
				<div className="cursor-pointer tracking-wide text-sm dark:text-white text-black" onClick={() => props.handleClose()} role="button">
					BACK
				</div>
			</div>
			<div className={`overflow-y-scroll flex flex-col gap-y-2  ${appearanceTheme === "light" ? 'customScrollLightMode' : ''}`}>
				{clickedRole === 'New Role' ? (
					<div>
						<button className={`block w-full py-2 px-4 rounded text-[15px] bg-gray-500 hover:bg-gray-70 text-white font-bold`}>
							{nameRoleNew}
						</button>
					</div>
				) : (
					activeRoles.map((role) => (
						<div key={role.id}>
							<button
								onClick={() => handleRoleClick(role.id)}
								className={`w-full py-2 px-4 rounded text-[15px] ${
									clickedRole === role.id ? 'dark:bg-[#535353] bg-[#b6b6b6] font-bold hover:op' : 'dark:bg-[#1E1E1E] bg-[#cacaca] hover:font-bold'
								} dark:text-textDarkTheme text-textLightTheme truncate`}
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
