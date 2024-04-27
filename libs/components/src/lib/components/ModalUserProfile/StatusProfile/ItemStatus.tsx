import { Icons } from '@mezon/components';
import { ReactNode } from 'react';

type ItemStatusProps = {
	children: string;
	dropdown?: boolean;
	type?: 'radio' | 'checkbox' | 'none';
	startIcon?: ReactNode;
	onClick?: () => void;
};

const ItemStatus = ({ children, dropdown, startIcon, type, onClick }: ItemStatusProps) => {
	return (
		<div onClick={onClick} className="flex items-center justify-between rounded-sm hover:bg-zinc-700 hover:[&>*]:text-[#fff] px-2">
			{startIcon && <div className="flex items-center justify-center h-[18px] w-[18px] mr-2">{startIcon}</div>}
			<li className="text-[14px] text-[#B5BAC1] w-full py-[6px] cursor-pointer list-none ">{children}</li>
			{dropdown && <Icons.RightIcon defaultFill="#fff" />}
		</div>
	);
};

export default ItemStatus;
