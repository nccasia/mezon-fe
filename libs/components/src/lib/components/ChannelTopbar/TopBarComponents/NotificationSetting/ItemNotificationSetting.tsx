import { Icons } from '@mezon/components';
import { Checkbox, Radio } from 'flowbite-react';

type ItemNotificationSettingProps = {
	children: string;
	dropdown?: string;
	type?: 'radio' | 'checkbox' | 'none';
	onClick?: () => void;
};

const ItemNotificationSetting = ({ children, dropdown, type, onClick }: ItemNotificationSettingProps) => {
	return (
		<div onClick={onClick} className="flex items-center justify-between rounded-sm hover:bg-[#0040C1] hover:[&>*]:text-[#fff] pr-2">
			<li className="text-[14px] text-[#B5BAC1] w-full py-[6px] px-[8px] cursor-pointer list-none ">{children}</li>
			{dropdown && <Icons.RightIcon defaultFill="#fff" />}
			{type === 'checkbox' && <Checkbox id="accept" defaultChecked />}
			{type === 'radio' && <Radio className="" value="change here" />}
		</div>
	);
};

export default ItemNotificationSetting;
