import { Icons } from '@mezon/components';
import {
	rolesClanActions,
	selectAllRolesClan,
	selectTheme,
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
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteModal } from '../DeleteRoleModal/deleteRoleModal';
import ServerSettingRoleManagement from '../SettingRoleManagement';
import ListActiveRole from './listActiveRole';

export type ModalOpenEdit = {
	handleOpen?: () => void;
};
const ServerSettingMainRoles = (props: ModalOpenEdit) => {
	const rolesClan = useSelector(selectAllRolesClan);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [openEdit, setOpenEdit] = useState<boolean>(false);
	const [selectedRoleId, setSelectedRoleID] = useState<string>('');
	const dispatchRole = useDispatch();
	const dispatch = useAppDispatch();
	const roles = useMemo(() => rolesClan.filter((role) => role.active === 1), [rolesClan]);
	const [activeRoles, setActiveRoles] = useState(roles);
	const numRoles = useMemo(() => activeRoles.length, [activeRoles]);

	const handleRoleClick = (roleId: string) => {
		setSelectedRoleID(roleId);
		const activeRole = rolesClan.find((role) => role.id === roleId);
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
	const appearanceTheme = useSelector(selectTheme);

	const [valueSearch, setValueSearch] = useState('');
	useEffect(() => {
		setActiveRoles(roles.filter((role) => role?.title?.toLowerCase().includes(valueSearch.toLowerCase())));
	},[valueSearch]);

	return (
		<>
			{!openEdit && (
				<>
					<p className="text-sm dark:text-zinc-400 text-colorTextLightMode mb-4">
						Use roles to group your server members and assign permissions.
					</p>
					<div
						onClick={() => {
							handleRoleClick(rolesClan[0]?.id);
							setOpenEdit(true);
						}}
						className="rounded dark:bg-bgSecondary bg-bgLightMode p-4 pr-6 flex justify-between cursor-pointer group mb-4 dark:hover:bg-bgSecondaryHover hover:bg-bgLightModeButton"
					>
						<div className="flex gap-x-4 items-center">
							<div className="dark:bg-bgPrimary bg-white p-1 rounded-full h-fit">
								<Icons.MemberList defaultSize="w-5 h-5" />
							</div>
							<div className="dark:text-textThreadPrimary text-gray-500 dark:group-hover:text-white group-hover:text-black">
								<h4 className="text-base font-semibold">Default permissions</h4>
								<p className="text-xs">@everyone •&nbsp;applies to all server members</p>
							</div>
						</div>
						<Icons.ArrowDown defaultSize="w-[20px] h-[30px] -rotate-90 dark:text-textThreadPrimary text-gray-500 dark:group-hover:text-white group-hover:text-black" />
					</div>
					<div className="flex items-center space-x-4">
						<div className="w-full flex-grow">
							<InputField
								type="text"
								className="rounded w-full dark:text-white text-black border dark:border-bgTertiary px-2 py-1 focus:outline-none focus:border-white-500 dark:bg-bgTertiary bg-bgLightModeThird text-base"
								placeholder="Search Roles"
								onChange={(e) => setValueSearch(e.target.value)}
							/>
						</div>
						<button
							className="text-[15px] bg-blue-600 hover:bg-blue-500 rounded-[3px] py-[5px] px-2 text-nowrap font-medium"
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
					<p className="dark:text-textThreadPrimary text-gray-500 text-sm mt-2">
						Members use the colour of the highest role they have on this list. Drag roles to reorder them.&nbsp;
						<a href="" className="hover:underline text-[#00A8FC]">
							Need help with permissions?
						</a>
					</p>
					<br />
					<div className={`overflow-hidden w-full ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}>
						<table className="w-full divide-y divide-gray-200 dark:divide-gray-500">
							<thead>
								<tr className="h-11">
									<th
										scope="col"
										className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase tracking-wider w-1/2 text-left"
									>
										Roles - {numRoles}
									</th>
									<th
										scope="col"
										className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase tracking-wider w-1/4 text-center"
									>
										Members
									</th>
									<th
										scope="col"
										className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase tracking-wider w-1/4 text-center"
									></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-500">
								{numRoles === 0 ? (
									<tr className="h-14">
										<td className="dark:text-gray-300 text-gray-600 text-[15px]">
											<p className="inline-flex gap-x-2 mt-1.5">
												<Icons.RoleIcon defaultSize="w-5 h-5 min-w-5" />
												No Roles
											</p>
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
							</tbody>
						</table>
					</div>
				</>
			)}
			{showModal && <DeleteModal handleDelete={() => handleDeleteRole(selectedRoleId)} onClose={() => setShowModal(false)} />}
			<ServerSettingRoleManagement flagOption={openEdit} handleClose={() => setOpenEdit(false)} rolesClan={rolesClan} />
		</>
	);
};

export default ServerSettingMainRoles;
