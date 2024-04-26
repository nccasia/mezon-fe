import { Icons, MemberProfile } from '@mezon/components';
import { Dropdown } from 'flowbite-react';

const StatusProfile = () => {
	return (
		<>
			<Dropdown
				trigger="hover"
				dismissOnClick={true}
				renderTrigger={() => (
					<div>
						<ItemStatus children="Online" dropdown />
					</div>
				)}
				label=""
				placement="right-start"
				className="bg-[#232428] border-none ml-2 py-[6px] px-[8px] w-[200px]"
			>
				<ItemStatus children="Online" />
				<ItemStatus children="Idle" />
				<ItemStatus children="Do Not Disturb" />
				<ItemStatus children="Invisible" />
			</Dropdown>
			<ItemStatus children="Set Custom Status" />
			<div className="w-full border-b-[1px] border-[#40444b] opacity-70 text-center"></div>
			<Dropdown
				trigger="hover"
				dismissOnClick={true}
				renderTrigger={() => (
					<div>
						<ItemStatus children="Switch Accounts" dropdown />
					</div>
				)}
				label=""
				placement="right-start"
				className="bg-[#232428] border-none ml-2 py-[6px] px-[8px] w-[200px]"
			>
				<MemberProfile name={''} status={true} avatar={''} isHideStatus={false} numberCharacterCollapse={15} classParent="memberProfile" />
				<ItemStatus children="Manage Accounts" />
			</Dropdown>
		</>
	);
};

type ItemStatusProps = {
	children: string;
	dropdown?: boolean;
	type?: 'radio' | 'checkbox' | 'none';
	onClick?: () => void;
};

const ItemStatus = ({ children, dropdown, type, onClick }: ItemStatusProps) => {
	return (
		<div onClick={onClick} className="flex items-center justify-between rounded-sm hover:bg-[#0040C1] hover:[&>*]:text-[#fff] pr-2">
			<li className="text-[14px] text-[#B5BAC1] w-full py-[6px] px-[8px] cursor-pointer list-none ">{children}</li>
			{dropdown && <Icons.RightIcon defaultFill="#fff" />}
		</div>
	);
};

export default StatusProfile;
