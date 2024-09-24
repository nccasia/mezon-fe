import { AvatarImage } from '@mezon/components';
import { useMemberContext, useRoles } from '@mezon/core';
import { RolesClanEntity, selectAllRolesClan, selectTheme, useAppDispatch, usersClanActions } from '@mezon/store';
import { HighlightMatchBold } from '@mezon/ui';
import { EVERYONE_ROLE_ID } from '@mezon/utils';
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
	const RolesClan = useSelector(selectAllRolesClan);
	const appearanceTheme = useSelector(selectTheme);
	const userRolesClan = useMemo(() => {
		const activeRole: RolesClanEntity[] = [];
		const notUserRole: RolesClanEntity[] = [];
		RolesClan.map((role) => {
			if (role.id === EVERYONE_ROLE_ID) {
				return;
			}
			const checkHasRole = role.role_user_list?.role_users?.some((listUser) => listUser.id === userId);
			if (checkHasRole) {
				activeRole.push(role);
			} else {
				notUserRole.push(role);
			}
		});

		return {
			active: activeRole,
			notUserRole: notUserRole
		};
	}, [userId, RolesClan]);

	const { searchQuery } = useMemberContext();
	const dispatch = useAppDispatch();
	const { updateRole } = useRoles();

	const handleAddRoleMemberList = async (role: RolesClanEntity) => {
		await updateRole(role.clan_id || '', role.id, role.title || '', [userId], [], [], []);
		await dispatch(
			usersClanActions.addRoleIdUser({
				id: role.id,
				userId: userId
			})
		);
	};
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
					{userRolesClan?.active.length ? (
						<>
							<RoleNameCard roleName={userRolesClan.active[0]?.title || ''} />
							{userRolesClan?.active.length > 1 && (
								<span className="inline-flex gap-x-1 items-center text-xs rounded p-1 dark:bg-bgSecondary600 bg-slate-300 dark:text-contentTertiary text-colorTextLightMode hoverIconBlackImportant ml-1">
									<Tooltip
										content={
											<div className={'flex flex-col items-start'}>
												{userRolesClan?.active.slice(1).map((role, id) => (
													<div className={'my-0.5'} key={role.id}>
														<RoleNameCard roleName={role.title || ''} />
													</div>
												))}
											</div>
										}
										trigger={'hover'}
										style={appearanceTheme === 'light' ? 'light' : 'dark'}
										className="dark:!text-white !text-black"
									>
										<span className="text-xs font-medium px-1 cursor-pointer" style={{ lineHeight: '15px' }}>
											+{userRolesClan?.active.length - 1}
										</span>
									</Tooltip>
								</span>
							)}
						</>
					) : (
						'-'
					)}
					{userRolesClan.notUserRole.length > 0 && (
						<Tooltip
							content={
								<div className="max-h-52 overflow-y-auto overflow-x-hidden scrollbar-hide">
									<div className="flex flex-col gap-1 max-w-40">
										{userRolesClan.notUserRole.map((role) => (
											<div className="flex" onClick={() => handleAddRoleMemberList(role)} key={role.id}>
												<RoleNameCard roleName={role.title || ''} classNames="cursor-pointer h-6" />
											</div>
										))}
									</div>
								</div>
							}
							trigger="click"
						>
							<Tooltip content="Add Role">
								<span className=" inline-flex justify-center gap-x-1 w-6 aspect-square items-center rounded dark:bg-bgSecondary600 bg-slate-300 dark:text-contentTertiary text-colorTextLightMode hoverIconBlackImportant ml-1 text-base">
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

export default TableMemberItem;
