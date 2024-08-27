import { AvatarImage } from '@mezon/components';
import { selectAllRolesClan, selectTheme } from '@mezon/store';
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
		return RolesClan.filter((role) => {
			if (role.role_user_list?.role_users) {
				const list = role.role_user_list.role_users.filter((user) => user.id === userId);
				return list.length;
			}
			return false;
		});
	}, [userId, RolesClan]);

	return (
		<div className="flex flex-row justify-between items-center h-[48px] border-b-[1px] dark:border-borderDivider border-buttonLightTertiary last:border-b-0">
			<div className="flex-3 p-1">
				<div className="flex flex-row gap-2 items-center">
					<AvatarImage alt={username} userName={username} className="min-w-9 min-h-9 max-w-9 max-h-9" src={avatar} />
					<div className="flex flex-col">
						<p className="text-base font-medium">{displayName}</p>
						<p className="text-[11px] dark:text-textDarkTheme text-textLightTheme">{username}</p>
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
				{userRolesClan?.length ? (
					<span className={'inline-flex items-center'}>
						<RoleNameCard roleName={userRolesClan[0]?.title || ''} />
						{userRolesClan.length > 1 && (
							<span className="inline-flex gap-x-1 items-center text-xs rounded p-1 dark:bg-bgSecondary600 bg-slate-300 dark:text-contentTertiary text-colorTextLightMode hoverIconBlackImportant ml-1">
								<Tooltip
									content={
										<div className={'flex flex-col items-start'}>
											{userRolesClan.slice(1).map((role, id) => (
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
										+{userRolesClan.length - 1}
									</span>
								</Tooltip>
							</span>
						)}
					</span>
				) : (
					'-'
				)}
			</div>
			<div className="flex-3 p-1 text-center">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase">Signals</span>
			</div>
		</div>
	);
};

export default TableMemberItem;
