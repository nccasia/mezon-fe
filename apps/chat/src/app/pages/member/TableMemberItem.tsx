import { AvatarImage } from '@mezon/components';
import { useMemberContext, usePermissionChecker, useRoles } from '@mezon/core';
import { RolesClanEntity, selectRolesClanEntities, selectTheme, useAppDispatch, usersClanActions } from '@mezon/store';
import { HighlightMatchBold, Icons } from '@mezon/ui';
import { EPermission, EVERYONE_ROLE_ID } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import RoleNameCard from './RoleNameCard';

type TableMemberItemProps = {
	userId: string;
	username: string;
	avatar: string;
	clanJoinTime?: string;
	mezonJoinTime?: string;
	displayName: string;
};

const TableMemberItem = ({ userId, username, avatar, clanJoinTime, mezonJoinTime, displayName }: TableMemberItemProps) => {
	const rolesClanEntity = useSelector(selectRolesClanEntities);

	const appearanceTheme = useSelector(selectTheme);
	const userRolesClan = useMemo(() => {
		const activeRole: Record<string, string> = {};
		let userRoleLength = 0;

		for (const key in rolesClanEntity) {
			const checkHasRole = rolesClanEntity[key].role_user_list?.role_users?.some((listUser) => listUser.id === userId);
			if (checkHasRole) {
				activeRole[key] = key;
				userRoleLength++;
			}
		}

		return {
			usersRole: activeRole,
			length: userRoleLength
		};
	}, [userId, rolesClanEntity]);

	const { searchQuery } = useMemberContext();

	const [hasAdminPermission] = usePermissionChecker([EPermission.administrator, EPermission.manageClan]);

	return (
		<div className="flex flex-row justify-between items-center h-[48px] border-b-[1px] dark:border-borderDivider border-buttonLightTertiary last:border-b-0">
			<div className="flex-3 p-1">
				<div className="flex flex-row gap-2 items-center">
					<AvatarImage alt={username} userName={username} className="min-w-9 min-h-9 max-w-9 max-h-9" src={avatar} />
					<div className="flex flex-col">
						<p className="text-base font-medium">{HighlightMatchBold(displayName, searchQuery)}</p>
						<p className="text-[11px] dark:text-textDarkTheme text-textLightTheme">{HighlightMatchBold(username, searchQuery)}</p>
					</div>
				</div>
			</div>
			<div className="flex-1 p-1 text-center">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase">{clanJoinTime ?? '-'}</span>
			</div>
			<div className="flex-1 p-1 text-center">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase">
					{mezonJoinTime ? mezonJoinTime + ' ago' : '-'}
				</span>
			</div>
			<div className="flex-1 p-1 text-center">
				<span className={'inline-flex items-center'}>
					{userRolesClan?.length ? (
						<>
							<RoleNameCard roleName={rolesClanEntity[`${Object.keys(userRolesClan.usersRole)[0]}`].title || ''} />
							{userRolesClan.length > 1 && (
								<span className="inline-flex gap-x-1 items-center text-xs rounded p-1 dark:bg-bgSecondary600 bg-slate-300 dark:text-contentTertiary text-colorTextLightMode hoverIconBlackImportant ml-1">
									<Tooltip
										content={
											<div className={'flex flex-col items-start'}>
												{Object.keys(userRolesClan.usersRole)
													.slice(1)
													.map((userRole) => (
														<div className={'my-0.5'} key={rolesClanEntity[`${userRole}`].id}>
															<RoleNameCard roleName={rolesClanEntity[`${userRole}`].title || ''} />
														</div>
													))}
											</div>
										}
										trigger={'hover'}
										style={appearanceTheme === 'light' ? 'light' : 'dark'}
										className="dark:!text-white !text-black"
									>
										<span className="text-xs font-medium px-1 cursor-pointer" style={{ lineHeight: '15px' }}>
											+{userRolesClan.length - 1}
										</span>
									</Tooltip>
								</span>
							)}
						</>
					) : (
						'-'
					)}
					{hasAdminPermission && (
						<Tooltip
							content={
								<div className="max-h-52 overflow-y-auto overflow-x-hidden scrollbar-hide">
									<div className="flex flex-col gap-1 max-w-72">
										{<ListOptionRole userId={userId} rolesClanEntity={rolesClanEntity} userRolesClan={userRolesClan} />}
									</div>
								</div>
							}
							trigger="click"
							arrow={false}
						>
							<Tooltip content="Add Role">
								<span className="inline-flex justify-center gap-x-1 w-6 aspect-square items-center rounded dark:bg-bgSecondary600 bg-slate-300 dark:text-contentTertiary text-colorTextLightMode hoverIconBlackImportant ml-1 text-base">
									+
								</span>
							</Tooltip>
						</Tooltip>
					)}
				</span>
			</div>
			<div className="flex-3 p-1 text-center">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase">Signals</span>
			</div>
		</div>
	);
};

const ListOptionRole = ({
	rolesClanEntity,
	userRolesClan,
	userId
}: {
	rolesClanEntity: Record<string, RolesClanEntity>;
	userRolesClan: {
		usersRole: Record<string, string>;
		length: number;
	};
	userId: string;
}) => {
	const dispatch = useAppDispatch();
	const { updateRole } = useRoles();

	const handleAddRoleMemberList = async (role: RolesClanEntity) => {
		if (userRolesClan.usersRole[role.id]) {
			await updateRole(role.clan_id || '', role.id, role.title || '', [], [], [userId], []);
			return;
		}
		await updateRole(role.clan_id || '', role.id, role.title || '', [userId], [], [], []);
		await dispatch(
			usersClanActions.addRoleIdUser({
				id: role.id,
				userId: userId
			})
		);
	};

	const roleElements = [];
	for (const key in rolesClanEntity) {
		if (key !== EVERYONE_ROLE_ID) {
			roleElements.push(
				<div className="flex gap-2 items-center h-6 justify-between px-2" key={key}>
					<div className="text-transparent size-3 rounded-full bg-white" />
					<span className="text-xs font-medium px-1 truncate flex-1" style={{ lineHeight: '15px' }}>
						{rolesClanEntity[key].title}
					</span>
					<div className="relative flex flex-row justify-center">
						<input
							checked={!!userRolesClan.usersRole[key]}
							type="checkbox"
							className={`peer appearance-none forced-colors:appearance-auto relative w-4 h-4 border dark:border-textPrimary border-gray-600 rounded-md focus:outline-none`}
							onChange={() => handleAddRoleMemberList(rolesClanEntity[key])}
							key={key}
						/>
						<Icons.Check className="absolute invisible peer-checked:visible forced-colors:hidden w-4 h-4 pointer-events-none" />
					</div>
				</div>
			);
		}
	}

	return <>{roleElements}</>;
};
export default TableMemberItem;
