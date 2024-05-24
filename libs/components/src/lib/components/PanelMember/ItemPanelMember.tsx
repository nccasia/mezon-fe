import { Checkbox, Radio } from 'flowbite-react';
import * as Icons from '../Icons';

type ItemPanelMemberProps = {
	children: string;
	dropdown?: boolean;
	type?: 'radio' | 'checkbox' | 'none';
	danger?: boolean;
	onClick?: () => void;
};

const ItemPanelMember = ({ children, dropdown, type, danger, onClick }: ItemPanelMemberProps) => {
	return (
		<button onClick={onClick} className="flex items-center w-full justify-between rounded-sm hover:bg-bgSelectItem hover:[&>*]:text-[#fff] pr-2">
			<li
				className={`text-[14px] ${danger ? 'text-colorDanger' : 'dark:text-[#B5BAC1] text-textSecondary800'} font-medium w-full py-[6px] px-[8px] text-left cursor-pointer list-none`}
			>
				{children}
			</li>
			{dropdown && <Icons.RightIcon defaultFill="#fff" />}
			{type === 'checkbox' && <Checkbox id="accept" defaultChecked />}
			{type === 'radio' && <Radio className="" value="change here" />}
		</button>
	);
};

export default ItemPanelMember;
