import {
	RolesClanEntity,
	getIsShow,
	getNewNameRole,
	getSelectedRoleId,
	selectTheme,
	setAddMemberRoles,
	setNameRoleNew,
	setSelectedPermissions,
	setSelectedRoleId,
} from '@mezon/store';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../../../../../../../ui/src/lib/Icons';
type closeEditRole = {
	RolesClan: RolesClanEntity[];
	handleClose: () => void;
	handleUpdateUser: () => Promise<void>;
};
const SettingListRole = (props: closeEditRole) => {
	const { RolesClan, handleClose, handleUpdateUser } = props;
	const appearanceTheme = useSelector(selectTheme);
	const isChange = useSelector(getIsShow);

	const clickRole = useSelector(getSelectedRoleId);
	const [clickedRole, setClickedRole] = useState<null | string>(clickRole);
	const nameRoleNew = useSelector(getNewNameRole);

	const dispatch = useDispatch();
	const handleRoleClick = (roleId: string) => {
		handleUpdateUser();
		if (!isChange || clickedRole === 'New Role') {
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
			<div className="font-semibold mb-4 flex cursor-pointer" onClick={() => handleClose()}>
				<div className="rotate-90 -ml-[10px] dark:text-textDarkTheme text-textLightTheme">
					<Icons.ArrowDown />
				</div>
				<div className="tracking-wide text-base dark:text-textSecondary text-textSecondary800" role="button">
					BACK
				</div>
			</div>
			<div className={`overflow-y-scroll flex flex-col gap-y-2 hide-scrollbar  ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}>
				{clickedRole === 'New Role' && 
					<div>
						<button className="w-full py-1.5 px-[10px] text-[15px] dark:bg-[#4e5058] bg-bgModifierHoverLight dark:text-textDarkTheme text-textSecondary800 font-medium inline-flex gap-x-2 items-center rounded">
							<div className="size-3 bg-contentTertiary rounded-full min-w-3"></div>
							<span className="one-line">{nameRoleNew ?? 'New Role'}</span>
						</button>
					</div>
				}
				{activeRoles.map((role) => (
					<div key={role.id}>
						<button
							onClick={() => handleRoleClick(role.id)}
							className={`w-full py-1.5 px-[10px] rounded text-[15px] text-left font-semibold dark:hover:bg-bgModifierHover hover:bg-bgLightModeButton inline-flex gap-x-2 items-center ${
								clickedRole === role.id ? 'dark:bg-[#4e5058] bg-bgModifierHoverLight' : ''
							} dark:text-textDarkTheme text-textLightTheme`}
						>
							<div className="size-3 bg-contentTertiary rounded-full min-w-3"></div>
							<span className="one-line">{role.title}</span>
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default SettingListRole;
