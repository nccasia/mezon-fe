import { Icons } from '@mezon/components';
import { usePermissionChecker, useRoles, UserRestrictionZone } from '@mezon/core';
import {
	RolesClanEntity,
	selectAllRolesClan,
	selectCurrentChannelId,
	selectCurrentClan,
	selectMemberClanByUserId,
	selectTheme,
	useAppDispatch,
	useAppSelector,
	usersClanActions
} from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { ChangeEvent, Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type RoleUserProfileProps = {
	userID?: string;
};

const RoleUserProfile = ({ userID }: RoleUserProfileProps) => {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const userById = useAppSelector(selectMemberClanByUserId(userID || currentChannelId || ''));
	const { updateRole } = useRoles();
	const RolesClan = useSelector(selectAllRolesClan);
	const currentClan = useSelector(selectCurrentClan);

	const [searchTerm, setSearchTerm] = useState('');
	const activeRoles = RolesClan.filter((role) => role.active === 1);
	const userRolesClan = useMemo(() => {
		return userById?.role_id ? RolesClan.filter((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, RolesClan]);

	const [hasPermissionEditRole] = usePermissionChecker([EPermission.manageClan]);
	const activeRolesWithoutUserRoles = activeRoles.filter((role) => {
		const isRoleInUserRoles = userRolesClan.some((userRole) => userRole.id === role.id);
		return !isRoleInUserRoles;
	});

	const filteredListRoleBySearch = useMemo(() => {
		return activeRolesWithoutUserRoles?.filter((role) => {
			return role.slug !== 'everyone' && !userById.role_id?.includes(role.id) && role.title?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [activeRolesWithoutUserRoles, searchTerm]);

	const dispatch = useAppDispatch();

	const addRole = async (roleId: string) => {
		const activeRole = RolesClan.find((role) => role.id === roleId);
		const userIDArray = userById?.user?.id?.split(',');
		await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', userIDArray || [], [], [], []);
		await dispatch(
			usersClanActions.addRoleIdUser({
				id: roleId,
				channelId: currentChannelId,
				userId: userById?.user?.id
			})
		);
	};

	const deleteRole = async (roleId: string) => {
		const activeRole = RolesClan.find((role) => role.id === roleId);
		const userIDArray = userById?.user?.id?.split(',');
		await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', [], [], userIDArray || [], []);
		await dispatch(
			usersClanActions.removeRoleIdUser({
				id: roleId,
				channelId: currentChannelId,
				userId: userById?.user?.id
			})
		);
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
						{hasPermissionEditRole ? (
							<button className="p-0.5 rounded-full bg-white h-fit" onClick={() => deleteRole(role.id)}>
								<Tooltip
									content="Remove role"
									trigger="hover"
									animation="duration-500"
									style={appearanceTheme === 'light' ? 'light' : 'dark'}
									className="dark:!text-white !text-black"
								>
									<Icons.IconRemove className="dark:text-channelActiveColor text-channelActiveLightColor size-2" />
								</Tooltip>
							</button>
						) : (
							<div className="size-2 bg-white  rounded-full"></div>
						)}
						<span className="text-xs font-medium">{role.title}</span>
					</span>
				))}
				<UserRestrictionZone policy={hasPermissionEditRole}>
					<Tooltip
						content={<AddRolesComp addRole={addRole} filteredListRoleBySearch={filteredListRoleBySearch} setSearchTerm={setSearchTerm} />}
						trigger="click"
						placement="bottom-start"
						arrow={false}
						className="dark:bg-transparent bg-transparent p-0 h-60 w-[300px]"
					>
						<Tooltip
							content="Add roles"
							trigger="hover"
							animation="duration-500"
							style={appearanceTheme === 'light' ? 'light' : 'dark'}
							className="dark:text-white text-black"
						>
							<button className="flex gap-x-1 dark:text-[#AEAEAE] text-colorTextLightMode rounded p-1 dark:bg-slate-700 bg-slate-300 items-center">
								<Icons.Plus className="size-5 select-none" />
								<p className="text-xs m-0 font-medium select-none">Add Role</p>
							</button>
						</Tooltip>
					</Tooltip>
				</UserRestrictionZone>
			</div>
		</div>
	);
};

const AddRolesComp = ({
	addRole,
	filteredListRoleBySearch,
	setSearchTerm
}: {
	addRole: (roleId: string) => void;
	filteredListRoleBySearch: RolesClanEntity[];
	setSearchTerm: Dispatch<SetStateAction<string>>;
}) => {
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	return (
		<div className="absolute w-[300px] max-h-60 dark:bg-[#323232] bg-white p-2 dark:text-white text-black overflow-y: auto rounded border border-slate-300 dark:border-slate-700 flex flex-col gap-3">
			<div className="relative w-full h-9">
				<input
					type="text"
					className="w-full border-[#1d1c1c] rounded-[5px] dark:bg-[#1d1c1c] bg-bgLightModeSecond p-2 mb-2"
					placeholder="Role"
					onChange={handleInputChange}
					onClick={(e) => e.stopPropagation()}
				/>
				<Icons.Search className="size-5 dark:text-white text-colorTextLightMode absolute right-2 top-2" />
			</div>
			<div className="w-full flex-1 overflow-y-scroll overflow-x-hidden hide-scrollbar space-y-1">
				{filteredListRoleBySearch.length > 0 ? (
					filteredListRoleBySearch.map((role, index) => (
						<div
							key={index}
							className="text-base w-full rounded-[10px] p-2 bg-transparent mr-2 dark:hover:bg-gray-800 hover:bg-bgLightModeButton flex gap-2 items-center dark:text-white text-colorTextLightMode"
							onClick={() => addRole(role.id)}
						>
							<div className="size-3 min-w-3 dark:bg-white bg-bgLightModeButton rounded-full"></div>
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
	);
};

export default RoleUserProfile;
