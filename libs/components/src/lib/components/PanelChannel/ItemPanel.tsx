import { Checkbox, Radio } from 'flowbite-react';
import * as Icons from '../Icons';

type ItemPanelProps = {
	children: string;
	dropdown?: string;
	danger?: boolean;
	type?: 'radio' | 'checkbox' | 'none';
	onClick?: () => void;
};

const ItemPanel = ({ children, dropdown, type, danger, onClick }: ItemPanelProps) => {
	return (
		<button onClick={onClick} className="flex items-center w-full justify-between rounded-sm hover:bg-bgSelectItem hover:[&>*]:text-[#fff] pr-2">
			<li
				className={`text-[14px] ${danger ? 'dark:text-colorDanger text-colorDanger' : 'dark:text-[#B5BAC1] text-textSecondary800'} dark:text-[#B5BAC1] text-colorTextLightMode font-medium w-full py-[6px] px-[8px] text-left cursor-pointer list-none textWhiteHoverImportant m-0`}
			>
				{children}
			</li>
			{dropdown && <Icons.RightIcon defaultFill="#fff" />}
			{type === 'checkbox' && <Checkbox id="accept" defaultChecked />}
			{type === 'radio' && <Radio className="" value="change here" />}
		</button>
	);
};

export default ItemPanel;
