import { useApp } from '@mezon/core';
import {
	rolesClanActions,
	selectAllRolesClan,
	setAddMemberRoles,
	setAddPermissions,
	setNameRoleNew,
	setRemoveMemberRoles,
	setRemovePermissions,
	setSelectedPermissions,
	setSelectedRoleId,
	useAppDispatch,
} from '@mezon/store';
import { InputField } from '@mezon/ui';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ServerSettingRoleManagement from '../SettingRoleManagement';
import ListActiveRole from './listActiveRole';
import { DeleteModal } from '../DeleteRoleModal/deleteRoleModal';

export type ModalOpenEdit = {
	handleOpen?: () => void;
};
const ServerSettingMainRoles = (props: ModalOpenEdit) => {
	const RolesClan = useSelector(selectAllRolesClan);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [openEdit, setOpenEdit] = useState<boolean>(false);
	const [selectedRoleId, setSelectedRoleID] = useState<string>('');
	const dispatchRole = useDispatch();
	const dispatch = useAppDispatch();
	const activeRoles = useMemo(() => RolesClan.filter((role) => role.active === 1),[RolesClan]);

	const handleRoleClick = (roleId: string) => {
		setSelectedRoleID(roleId);
		const activeRole = RolesClan.find((role) => role.id === roleId);
		const permissions = activeRole?.permission_list?.permissions;
		const permissionIds = permissions ? permissions.filter((permission) => permission.active === 1).map((permission) => permission.id) : [];
		const memberIDRoles = activeRole?.role_user_list?.role_users?.map((member) => member.id) || [];
		dispatchRole(setSelectedPermissions(permissionIds));
		dispatchRole(setNameRoleNew(activeRole?.title));
		dispatchRole(setSelectedRoleId(roleId));
		dispatchRole(setAddPermissions([]));
		dispatchRole(setRemovePermissions([]));
		dispatchRole(setAddMemberRoles(memberIDRoles));
		dispatchRole(setRemoveMemberRoles([]));
	};
	
	const handleDeleteRole = async (roleId: string) => {
		await dispatch(rolesClanActions.fetchDeleteRole({ roleId }));
	};

	const { appearanceTheme } = useApp();
	return (
		<>
			<div className="flex items-center space-x-4">
				<div className="w-full flex-grow">
					<InputField
						type="text"
						className="text-[15px] rounded-[3px] w-full dark:text-white text-black border dark:border-black px-4 py-2 focus:outline-none focus:border-white-500 dark:bg-black bg-white"
						placeholder="Search Roles"
					/>
				</div>
				<button
					className="text-[15px] bg-blue-600 hover:bg-blue-500 rounded-[3px] py-[8px] px-[10px] text-nowrap"
					onClick={() => {
						dispatch(setSelectedRoleId('New Role'));
						dispatch(setNameRoleNew('New Role'));
						dispatch(setAddPermissions([]));
						dispatch(setAddMemberRoles([]));
						setOpenEdit(true);
					}}
				>
					Create Role
				</button>
			</div>
			<br />
			<div className={`overflow-y-auto relative w-full ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}>
				<table className="w-full divide-y divide-gray-200">
					<thead className="dark:bg-borderDefault bg-bgLightMode sticky top-0">
						<tr className="h-11">
							<th scope="col" className="  text-sm font-bold dark:text-gray-200 text-black uppercase tracking-wider w-1/2 text-center">
								Roles - {RolesClan.length}
							</th>
							<th scope="col" className=" text-sm font-bold dark:text-gray-200 text-black uppercase tracking-wider w-1/4 text-center">
								Members
							</th>
							<th scope="col" className=" text-sm font-bold dark:text-gray-200 text-black uppercase tracking-wider w-1/4 text-center">
								Options
							</th>
						</tr>
					</thead>
					<tbody className="dark:bg-bgSecondary bg-bgLightMode divide-y divide-gray-200">
						{activeRoles.length === 0 ? (
							<tr className="h-14">
								<td className="dark:text-gray-300 text-gray-600 text-center text-[15px]">
									<p>No Roles</p>
								</td>
							</tr>
						) : (
							<ListActiveRole 
								activeRoles={activeRoles} 
								setShowModal={setShowModal}
								handleRoleClick={handleRoleClick}
								setOpenEdit={setOpenEdit}
							/>
						)}
						{showModal &&
							<DeleteModal
								handleDelete={() => handleDeleteRole(selectedRoleId)}
								onClose={() => setShowModal(false)}
							/>
                    	}
					</tbody>
				</table>
			</div>
			<ServerSettingRoleManagement flagOption={openEdit} handleClose={() => setOpenEdit(false)} RolesClan={RolesClan}/>
		</>
	);
};

export default ServerSettingMainRoles;
