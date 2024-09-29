import { Icons } from '@mezon/components';
import { useClanOwner } from '@mezon/core';
import { RolesClanEntity, selectTheme, selectUserMaxPermissionLevel } from '@mezon/store';
import { RoleEveryOne, SlugPermission } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { ApiPermission } from 'mezon-js/api.gen';
import { useSelector } from 'react-redux';

type ListActiveRoleProps = {
	activeRoles: RolesClanEntity[];
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
	setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
	handleRoleClick: (roleId: string) => void;
};

const ListActiveRole = (props: ListActiveRoleProps) => {
	const { activeRoles, handleRoleClick, setShowModal, setOpenEdit } = props;
	const isClanOwner = useClanOwner();
	const appearanceTheme = useSelector(selectTheme);
	const userMaxPermissionLevel = useSelector(selectUserMaxPermissionLevel);

	return activeRoles
		.filter((role) => role.creator_id !== RoleEveryOne.TRUE)
		.map((role) => {
			console.log(role);
			const hasPermissionEdit = isClanOwner || Number(userMaxPermissionLevel) > Number(role.max_level_permission);
			return (
				<tr key={role.id} className="h-14 dark:text-white text-black group dark:hover:bg-bgModifierHover hover:bg-bgLightModeButton">
					<td>
						<p
							className="inline-flex items-center text-[15px] break-all whitespace-break-spaces overflow-hidden line-clamp-2 font-medium mt-1.5"
							onClick={() => {
								setShowModal(false);
							}}
						>
							<Icons.RoleIcon defaultSize="w-5 h-[30px] min-w-5 mr-2" />
							{!hasPermissionEdit && <Icons.IconLock defaultSize="size-3 text-contentTertiary" />}
							<span className="one-line">{role.title}</span>
						</p>
					</td>
					<td className="text-[15px] text-center">
						<p className="inline-flex gap-x-2 items-center dark:text-textThreadPrimary text-gray-500">
							{role.role_user_list?.role_users?.length ?? 0}
							<Icons.MemberIcon defaultSize="w-5 h-[30px] min-w-5" />
						</p>
					</td>
					<td className="  flex h-14 justify-center items-center">
						<div className="flex gap-x-2">
							<div
								className="text-[15px] cursor-pointer dark:hover:bg-slate-800 hover:bg-bgModifierHoverLight dark:bg-bgTertiary bg-bgLightModeThird p-2 rounded-full opacity-0 group-hover:opacity-100"
								onClick={() => {
									handleRoleClick(role.id);
									setOpenEdit(true);
								}}
							>
								{hasPermissionEdit ? (
									<Tooltip
										content="Edit"
										trigger="hover"
										animation="duration-500"
										style={appearanceTheme === 'light' ? 'light' : 'dark'}
									>
										<Icons.PenEdit className="size-5" />
									</Tooltip>
								) : (
									<Tooltip
										content="View"
										trigger="hover"
										animation="duration-500"
										style={appearanceTheme === 'light' ? 'light' : 'dark'}
									>
										<Icons.ViewRole defaultSize="size-5" />
									</Tooltip>
								)}
							</div>
							<div
								className={`text-[15px] cursor-pointer dark:hover:bg-slate-800 hover:bg-bgModifierHoverLight dark:bg-bgTertiary bg-bgLightModeThird p-2 rounded-full ${hasPermissionEdit ? 'opacity-100' : 'opacity-20'}`}
								onClick={
									hasPermissionEdit
										? () => {
												setShowModal(true);
												handleRoleClick(role.id);
											}
										: () => {}
								}
							>
								<Tooltip
									content="Delete"
									trigger="hover"
									animation="duration-500"
									style={appearanceTheme === 'light' ? 'light' : 'dark'}
								>
									<Icons.DeleteMessageRightClick defaultSize="size-5" />
								</Tooltip>
							</div>
						</div>
					</td>
				</tr>
			);
		});
};

export default ListActiveRole;

export function useCheckHasAdministrator(permissions?: ApiPermission[]) {
	return permissions?.some((permission) => permission.slug === SlugPermission.Admin && permission.active === 1);
}
