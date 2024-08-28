import { selectAllUsesClan } from '@mezon/store';
import { getTimeDifferenceDate } from '@mezon/utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import TableMemberHeader from './TableMemberHeader';
import TableMemberItem from './TableMemberItem';

interface ITableMemberProps {
	currentPage: number;
	pageSize: number;
}

const TableMember: React.FC<ITableMemberProps> = ({ currentPage, pageSize }) => {
	const usersClan = useSelector(selectAllUsesClan);
	const displayUsersClan = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		const end = Math.min(start + pageSize, usersClan.length);
		return usersClan.slice(start, end);
	}, [currentPage, pageSize, usersClan]);

	return (
		<div className="flex flex-col flex-1 min-h-[48px]">
			<TableMemberHeader />
			<div className="flex flex-col overflow-y-auto px-4 py-2 shadow border-b-[1px] dark:border-bgTertiary border-t-[textSecondary]">
				{displayUsersClan.map((user) => (
					<TableMemberItem
						key={user.id}
						username={user.user?.username ?? ''}
						avatar={user.user?.avatar_url ?? ''}
						mezonJoinTime={getTimeDifferenceDate(user.user?.create_time || '')}
						clanJoinTime={user.user?.join_time}
						userId={user.id}
						displayName={user.user?.display_name ?? ''}
					/>
				))}
			</div>
		</div>
	);
};

export default TableMember;
