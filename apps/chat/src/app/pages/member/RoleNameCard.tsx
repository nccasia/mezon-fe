import React from 'react';

interface IRoleNameCardProps {
	roleName: string;
}

const RoleNameCard: React.FC<IRoleNameCardProps> = ({ roleName }) => {
	return (
		<span className="inline-flex gap-x-1 items-center text-xs rounded p-1 dark:bg-slate-800 bg-slate-300 dark:text-borderDividerLight text-colorTextLightMode hoverIconBlackImportant truncate max-w-24">
			<div className="text-transparent size-3 rounded-full bg-white" />
			<span className="text-xs font-medium px-1 truncate max-w-16" style={{ lineHeight: '15px' }}>
				{roleName}
			</span>
		</span>
	);
};

export default RoleNameCard;
