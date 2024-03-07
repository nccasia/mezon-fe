// import SettingRightClan from '../SettingRightClanProfile';

import { useRoles } from '@mezon/core';
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

export type ModalOpenEdit = {
	handleOpen: () => void;
};
// import SettingRightUser from '../SettingRightUserProfile';
const ServerSettingMainRoles = (props: ModalOpenEdit) => {
	const { RolesClan } = useRoles();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [selectedRoleId, setSelectedRoleID] = useState<string>('');
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
	return (
		<>
			<h1 className="text-2xl font-bold tracking-wider mb-8">Roles</h1>
			<div className="flex items-center space-x-4">
				<div className="w-full flex-grow">
					<InputField
						type="text"
						className="rounded-[3px] w-full text-white border border-black px-4 py-2 focus:outline-none focus:border-white-500 bg-black"
						placeholder="Search Roles"
					/>
				</div>
				<button
					className="bg-blue-600 hover:bg-blue-500 rounded-[3px] py-[8px] px-[10px] text-nowrap"
					onClick={() => {
						dispatch(setSelectedRoleId('New Role'));
						dispatch(setNameRoleNew('New Role'));
						dispatch(setAddPermissions([]));
						dispatch(setAddMemberRoles([]));
						props.handleOpen();
					}}
				>
					Create Role
				</button>
			</div>
			<br />
			<div className="overflow-y-scroll relative w-full">
				<table className="w-full divide-y divide-gray-200">
					<thead className="bg-borderDefault sticky top-0">
						<tr className="h-11">
							<th scope="col" className="  text-sm font-bold text-gray-200 uppercase tracking-wider w-1/2 text-center">
								Roles - {RolesClan.length}
							</th>
							<th scope="col" className=" text-sm font-bold text-gray-200 uppercase tracking-wider w-1/4 text-center">
								Members
							</th>
							<th scope="col" className=" text-sm font-bold text-gray-200 uppercase tracking-wider w-1/4 text-center">
								Options
							</th>
						</tr>
					</thead>
					<tbody className="bg-bgSecondary divide-y divide-gray-200">
						{activeRoles.length === 0 ? (
							<tr className="h-14">
								<td className=" text-gray-300 text-center">
									<p>No Roles</p>
								</td>
							</tr>
						) : (
							activeRoles.map((role) => (
								<tr key={role.id} className="h-14">
									<td className="text-center ">
										<p
											className="break-all whitespace-break-spaces overflow-hidden line-clamp-2"
											onClick={() => {
												handleCloseModal();
											}}
										>
											{role.title}
										</p>
									</td>
									<td className="  text-center">
										<p>{role.role_user_list?.role_users?.length ?? 0}</p>
									</td>
									<td className="  flex h-14 justify-center items-center">
										<div className="flex gap-x-1 ">
											<p
												className="cursor-pointer hover:bg-slate-800 p-2 rounded-sm"
												onClick={() => {
													props.handleOpen();
													handleRoleClick(role.id);
												}}
											>
												Edit
											</p>
											<p
												className="cursor-pointer hover:bg-slate-800 p-2 rounded-sm"
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
		</>
	);
};

export default ServerSettingMainRoles;
