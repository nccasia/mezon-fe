import { Icons } from '@mezon/components';
import { ChannelMembersEntity, useAppDispatch, userClanProfileActions } from '@mezon/store';
import { Dropdown } from 'flowbite-react';
import { OnlineStatus } from '../../Icons';
import ItemProfile from './ItemProfile';
import ItemStatus from './ItemStatus';

type StatusProfileProps = {
	userById: ChannelMembersEntity | null;
};

const StatusProfile = ({ userById }: StatusProfileProps) => {
	const dispatch = useAppDispatch();

	const user = userById?.user;

	const handleCustomStatus = () => {
		dispatch(userClanProfileActions.setShowModalCustomStatus(true));
	};

	return (
		<>
			<div>
				<Dropdown
					trigger="click"
					dismissOnClick={true}
					renderTrigger={() => (
						<div>
							<ItemStatus children="Online" dropdown startIcon={<OnlineStatus className="w-5" />} />
						</div>
					)}
					label=""
					placement="right-start"
					className="bg-[#232428] border-none ml-2 py-[6px] px-[8px] w-[200px]"
				>
					<ItemStatus children="Online" startIcon={<OnlineStatus />} />
					<div className="w-full border-b-[1px] border-[#40444b] opacity-70 text-center my-2"></div>
					<ItemStatus children="Idle" startIcon={<Icons.DarkModeIcon className="text-[#F0B232] -rotate-90" />} />
					<ItemStatus children="Do Not Disturb" startIcon={<Icons.MinusCircleIcon />} />
					<ItemStatus children="Invisible" startIcon={<Icons.OfflineStatus />} />
					<div className="w-full border-b-[1px] border-[#40444b] opacity-70 text-center my-2"></div>
				</Dropdown>
				<ItemStatus onClick={handleCustomStatus} children="Set Custom Status" startIcon={<Icons.SmilingFace />} />
			</div>
			<div className="w-full border-b-[1px] border-[#40444b] opacity-70 text-center"></div>
			<Dropdown
				trigger="click"
				dismissOnClick={true}
				renderTrigger={() => (
					<div>
						<ItemStatus children="Switch Accounts" dropdown startIcon={<Icons.ConvertAccount />} />
					</div>
				)}
				label=""
				placement="right-start"
				className="bg-[#232428] border-none ml-2 py-[6px] px-[8px] w-[100px]"
			>
				<ItemProfile avatar={user?.avatar_url} username={user?.username} />
				<div className="w-full border-b-[1px] border-[#40444b] opacity-70 text-center my-2"></div>
				<ItemStatus children="Manage Accounts" />
			</Dropdown>
		</>
	);
};

export default StatusProfile;
