import { useRoles } from '@mezon/core';
import { getSelectedRoleId, toggleIsShowFalse } from '@mezon/store';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SettingDisplayRole from '../SettingDisplayRole';
import SettingManageMembers from '../SettingManageMembers';
import SettingPermissions from '../SettingPermissions';
const SettingValueDisplayRole = () => {
	const [selectedButton, setSelectedButton] = useState<string | null>('Display');
	const { RolesClan } = useRoles();
	const clickRole = useSelector(getSelectedRoleId);
	const activeRole = RolesClan.find((role) => role.id === clickRole);
	const dispatch = useDispatch();
	const handleButtonClick = (buttonName: string) => {
		setSelectedButton(buttonName);
	};

	const roleUsersCount = activeRole?.role_user_list?.role_users?.length || 0;
	return (
		<>
			<div className="w-full flex justify-between mb-5">
				<button
					className={`p-[5px] text-white  text-left transition duration-300 relative tracking-wider ${selectedButton === 'Display' ? 'shadow-md' : ''}`}
					onClick={() => {
						handleButtonClick('Display');
						dispatch(toggleIsShowFalse());
					}}
				>
					Display
					{selectedButton === 'Display' && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-400" />}
				</button>

				<button
					className={`p-[5px] text-white  text-left transition duration-300 relative tracking-wider ${selectedButton === 'Permissions' ? 'shadow-md' : ''}`}
					onClick={() => {
						handleButtonClick('Permissions');
						dispatch(toggleIsShowFalse());
					}}
				>
					Permissions
					{selectedButton === 'Permissions' && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-400" />}
				</button>
				<button
					className={`p-[5px] text-white text-left transition duration-300 relative tracking-wider ${selectedButton === 'Manage Members' ? 'shadow-md' : ''}`}
					onClick={() => {
						handleButtonClick('Manage Members');
						dispatch(toggleIsShowFalse());
					}}
				>
					Manage Members ({roleUsersCount > 0 ? roleUsersCount : 0})
					{selectedButton === 'Manage Members' && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-400" />}
				</button>
			</div>
			{selectedButton === 'Display' && <SettingDisplayRole />}
			{selectedButton === 'Permissions' && <SettingPermissions />}
			{selectedButton === 'Manage Members' && <SettingManageMembers />}
		</>
	);
};

export default SettingValueDisplayRole;
