import { Icons } from '@mezon/components';
import { UserRestrictionZone, useClanRestriction, useRoles } from '@mezon/core';
import { selectAllRolesClan, selectCurrentChannelId, selectCurrentClan, selectMemberByUserId, selectTheme } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { ChangeEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type RoleUserProfileProps = {
	userID?: string;
};

const RoleUserProfile = ({ userID }: RoleUserProfileProps) => {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const userById = useSelector(selectMemberByUserId(userID ?? ''));
	const { updateRole } = useRoles(currentChannelId || '');
	const RolesClan = useSelector(selectAllRolesClan);
	const currentClan = useSelector(selectCurrentClan);

	const [searchTerm, setSearchTerm] = useState('');
	const activeRoles = RolesClan.filter((role) => role.active === 1);
	const [showPopupAddRole, setShowPopupAddRole] = useState(false);
	const userRolesClan = useMemo(() => {
		return userById?.role_id ? RolesClan.filter((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, RolesClan]);
	const activeRolesWithoutUserRoles = activeRoles.filter((role) => !userRolesClan.some((userRole) => userRole.id === role.id));

	const [hasManageChannelPermission, { isClanCreator }] = useClanRestriction([EPermission.manageChannel]);

	const [positionTop, setPositionTop] = useState(40);
	const [positionLeft, setPositionLeft] = useState(0);
	const handModalAddRole = (e: any) => {
		if (showPopupAddRole) {
			setShowPopupAddRole(false);
			return;
		}
		setShowPopupAddRole(true);
		const clickY = e.clientY;
		const windowHeight = window.innerHeight;
		const distanceToBottom = windowHeight - clickY;
		const heightModalAddRole = 180;
		if (distanceToBottom < heightModalAddRole) {
			setPositionTop(-50);
			setPositionLeft(-320);
		}
	};
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const filteredListRoleBySearch = useMemo(() => {
		return activeRolesWithoutUserRoles?.filter((role) => {
			return role.title?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [activeRolesWithoutUserRoles, searchTerm]);
	const addRole = async (roleId: string) => {
		setShowPopupAddRole(false);
		const activeRole = RolesClan.find((role) => role.id === roleId);
		const userIDArray = userById?.user?.id?.split(',');
		await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', userIDArray || [], [], [], []);
	};

	const deleteRole = async (roleId: string) => {
		const activeRole = RolesClan.find((role) => role.id === roleId);
		const userIDArray = userById?.user?.id?.split(',');
		await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', [], [], userIDArray || [], []);
	};
	const appearanceTheme = useSelector(selectTheme);
	return (
		<div className="flex flex-col">
			<div className="font-bold tracking-wider text-sm pt-2">ROLES</div>
			<div className="mt-2 flex flex-wrap gap-2">
				{userRolesClan.map((role, index) => (
					<span
						key={`${role.id}_${index}`}
						className="inline-flex gap-x-1 items-center text-xs rounded p-1 dark:bg-slate-700 bg-slate-300 dark:text-[#AEAEAE] text-colorTextLightMode hoverIconBlackImportant"
					>
						<button className="p-0.5 rounded-full bg-white h-fit" onClick={() => deleteRole(role.id)}>
							<Tooltip
								content="Remove role"
								trigger="hover"
								animation="duration-500"
								style={appearanceTheme === 'light' ? 'light' : 'dark'}
								className="dark:!text-white !text-black"
							>
								<Icons.IconRemove className="text-transparent size-2" />
							</Tooltip>
						</button>
						<span className="text-xs font-medium" style={{ lineHeight: '15px' }}>
							{role.title}
						</span>
					</span>
				))}
				<UserRestrictionZone policy={isClanCreator || hasManageChannelPermission}>
					<div className="relative" onClick={handModalAddRole}>
						<Tooltip
							content="Add roles"
							trigger="hover"
							animation="duration-500"
							style={appearanceTheme === 'light' ? 'light' : 'dark'}
							className="dark:text-white text-black"
						>
							<button className="flex gap-x-1 dark:text-[#AEAEAE] text-colorTextLightMode rounded p-1 dark:bg-slate-700 bg-slate-300">
								<Icons.Plus />
								<p className="text-xs m-0 font-medium">Add Role</p>
							</button>
						</Tooltip>
						<div className="absolute" style={{ top: `${positionTop}px`, left: `${positionLeft}px` }}>
							{showPopupAddRole ? (
								<div className="w-[300px] h-fit dark:bg-[#323232] bg-white p-2 dark:text-white text-black overflow-y: auto rounded border border-slate-300 dark:border-slate-700">
									<div className="relative">
										<input
											type="text"
											className="w-full border-[#1d1c1c] rounded-[5px] dark:bg-[#1d1c1c] bg-bgLightModeSecond p-2 mb-2"
											placeholder="Role"
											onChange={handleInputChange}
											onClick={(e) => e.stopPropagation()}
										/>
										<Icons.Search className="size-5 dark:text-white text-colorTextLightMode absolute right-2 top-2" />
									</div>
									<div className="max-h-[100px] overflow-y-scroll overflow-x-hidden hide-scrollbar space-y-1">
										{filteredListRoleBySearch.length > 0 ? (
											filteredListRoleBySearch.map((role, index) => (
												<div
													key={index}
													className="text-base w-full rounded-[10px] p-2 bg-transparent mr-2 dark:hover:bg-gray-800 hover:bg-bgLightModeButton flex gap-2 items-center dark:text-white text-colorTextLightMode"
													onClick={() => addRole(role.id)}
												>
													<div className="size-3 dark:bg-white bg-bgLightModeButton rounded-full"></div>
													{role.title}
												</div>
											))
										) : (
											<div className="flex flex-col py-4 gap-y-4 items-center">
												<p className="font-medium dark:text-white text-black">Nope!</p>
												<p className="font-normal dark:text-zinc-400 text-colorTextLightMode">Did you make a typo?</p>
											</div>
										)}
									</div>
								</div>
							) : null}
						</div>
					</div>
				</UserRestrictionZone>
			</div>
		</div>
	);
};

export default RoleUserProfile;
