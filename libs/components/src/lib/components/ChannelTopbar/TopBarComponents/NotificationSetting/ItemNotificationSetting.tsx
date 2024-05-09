import { Icons } from '@mezon/components';
import { Checkbox, Radio } from 'flowbite-react';

type ItemNotificationSettingProps = {
	children: string;
	dropdown?: string;
	name?: string;
	type?: 'radio' | 'checkbox' | 'none';
	onClick?: () => void;
};

const ItemNotificationSetting = ({ children, dropdown, type, name }: ItemNotificationSettingProps) => {
const onClick = (notification:string) => {
	console.log("notification: ", notification);
	
}
	return (
		<div className="flex items-center justify-between rounded-sm hover:bg-[#0040C1] hover:[&>*]:text-[#fff] pr-2">
			<li className="text-[14px] text-[#B5BAC1] w-full py-[6px] px-[8px] cursor-pointer list-none ">{children}</li>
			{dropdown && <Icons.RightIcon defaultFill="#fff" />}
			{type === 'checkbox' && <Checkbox id="accept" defaultChecked />}
			{type === 'radio' && <Radio className="" name={name} value="change here" onClick={()=>onClick(children)}/>}
		</div>
	);
};

export default ItemNotificationSetting;
