import { useApp, useRoles } from '@mezon/core';
import {
	rolesClanActions,
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
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { DeleteModal } from '../DeleteRoleModal/deleteRoleModal';
import ServerSettingRoleManagement from '../SettingRoleManagement';

export type ModalOpenEdit = {
	handleOpen?: () => void;
};
const ServerSettingMainRoles = (props: ModalOpenEdit) => {
	const { RolesClan } = useRoles();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [selectedRoleId, setSelectedRoleID] = useState<string>('');
	const [openEdit, setOpenEdit] = useState<boolean>(false);

	const dispatchRole = useDispatch();
	const dispatch = useAppDispatch();
	const activeRoles = RolesClan.filter((role) => role.active === 1);
	const handleOpenModalDelete = () => {
		setShowModal(true);
	};
	const handleCloseModal = () => {
		setShowModal(false);
	};
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
							activeRoles.map((role) => (
								<tr key={role.id} className="h-14 dark:text-white text-black">
									<td className="text-center ">
										<p
											className="text-[15px] break-all whitespace-break-spaces overflow-hidden line-clamp-2"
											onClick={() => {
												handleCloseModal();
											}}
										>
											{role.title}
										</p>
									</td>
									<td className=" text-[15px] text-center">
										<p>{role.role_user_list?.role_users?.length ?? 0}</p>
									</td>
									<td className="  flex h-14 justify-center items-center">
										<div className="flex gap-x-1 ">
											<p
												className="text-[15px] cursor-pointer dark:hover:bg-slate-800 hover:bg-bgModifierHoverLight p-2 rounded-sm"
												onClick={() => {
													handleRoleClick(role.id);
													setOpenEdit(true);
												}}
											>
												Edit
											</p>
											<p
												className="text-[15px] cursor-pointer dark:hover:bg-slate-800 hover:bg-bgModifierHoverLight p-2 rounded-sm"
												onClick={() => {
													handleOpenModalDelete();
													handleRoleClick(role.id);
												}}
											>
												Delete
											</p>
										</div>
										<DeleteModal
											isOpen={showModal}
											handleDelete={() => handleDeleteRole(selectedRoleId)}
											onClose={handleCloseModal}
										/>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<ServerSettingRoleManagement flagOption={openEdit} handleClose={() => setOpenEdit(false)} />
		</>
	);
};

export default ServerSettingMainRoles;
