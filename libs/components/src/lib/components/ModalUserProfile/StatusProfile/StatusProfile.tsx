import { Icons, MemberProfile } from '@mezon/components';
import { useAppDispatch, userClanProfileActions } from '@mezon/store';
import { Dropdown } from 'flowbite-react';
import { useState } from 'react';
import { OnlineStatus } from '../../Icons';
import ItemStatus from './ItemStatus';
import ModalCustomStatus from './ModalCustomStatus';

export const StatusProfile = () => {
	const dispatch = useAppDispatch();
	const [openModal, setOpenModal] = useState(false);

	const handleCustomStatus = () => {
		setOpenModal(true);
		dispatch(userClanProfileActions.setShowModalFooterProfile(false));
	};

	console.log('openModal', openModal);
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
					<ItemStatus children="Invisible" startIcon={<Icons.StatusOffline />} />
					<div className="w-full border-b-[1px] border-[#40444b] opacity-70 text-center my-2"></div>
				</Dropdown>
				<ItemStatus onClick={handleCustomStatus} children="Set Custom Status" startIcon={<Icons.SmilingFace />} />
			</div>
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
			{openModal && <ModalCustomStatus openModal={openModal} />}
		</>
	);
};
