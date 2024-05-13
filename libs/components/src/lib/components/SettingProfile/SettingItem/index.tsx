import { authActions, useAppDispatch } from '@mezon/store';
import { LogoutModal } from 'libs/ui/src/lib/LogOutButton';
import { useState } from 'react';
const SettingItem = ({ onItemClick }: { onItemClick?: (settingName: string) => void }) => {
	const [selectedButton, setSelectedButton] = useState<string | null>('Profiles');
	const handleButtonClick = (buttonName: string) => {
		setSelectedButton(buttonName);
	};
	const [openModal, setOpenModal] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const handleOpenModal = () => {
		setOpenModal(true);
	};
	const handleLogOut = () => {
		dispatch(authActions.logOut());
	};
	const handleCloseModal = () => {
		setOpenModal(false);
		setSelectedButton('');
	};
	return (
		<div className=" overflow-y-auto w-1/6 xl:w-1/4 min-w-56 bg-bgSecondary flex justify-end pt-96 pr-2 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-200 2xl:flex-grow hide-scrollbar flex-grow">
			<div className="w-170px ">
				<p className="text-[#84ADFF] font-bold text-sm tracking-wider">USER SETTINGS</p>
				<button
					className={`text-[#AEAEAE] w-[170px] text-[16px] font-medium rounded-[5px] text-left ml-[-8px] p-2 mt-4 hover:text-white ${selectedButton === 'Account' ? 'bg-[#232E3B] text-white' : ''}`}
					onClick={() => {
						handleButtonClick('Account');
						onItemClick && onItemClick('Account');
					}}
				>
					My Account
				</button>
				<br />
				<button
					className={`p-2 text-[#AEAEAE]  pl-2 ml-[-8px] hover:text-white ${selectedButton === 'Profiles' ? 'bg-[#232E3B] text-white' : ''} mt-1 w-[170px] text-left rounded-[5px]`}
					onClick={() => {
						handleButtonClick('Profiles');
						onItemClick && onItemClick('Profiles');
					}}
				>
					Profiles
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Privacy & Safety
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Family Center
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Family Center
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Authorized Apps
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Devices
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Connections
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Clips
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium mb-[10px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Friend Requests
				</button>
				<hr className="border-t border-solid border-borderDefault mt-4" />
				<button className="pt-2 text-[#84ADFF] mt-4 font-bold text-sm tracking-wider">APP SETTINGS</button>
				<br />
				<button
					className={`p-2 text-[#AEAEAE]  pl-2 ml-[-8px] hover:text-white ${selectedButton === 'Appearance' ? 'bg-[#232E3B] text-white' : ''} mt-1 w-[170px] text-left rounded-[5px]`}
					onClick={() => {
						handleButtonClick('Appearance');
						onItemClick && onItemClick('Appearance');
					}}
				>
					Appearance
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Accessibility
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Voice & Video
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Text & Image
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Notifications
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Keybinds
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Language
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Streamer Mode
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[16px] font-medium w-[170px] rounded-[5px] text-left mt-1 ml-[-8px] hover:text-white">
					Advanced
				</button>
				<br />
				<button
					className={`p-2 text-[#AEAEAE] text-[16px] font-medium ${selectedButton === 'Log Out' ? 'bg-[#232E3B]' : ''} mt-1 w-[170px] text-left rounded-[5px] ml-[-8px] hover:text-white`}
					onClick={() => {
						handleButtonClick('Log Out');
						handleOpenModal();
					}}
				>
					Log Out
				</button>
				<LogoutModal isOpen={openModal} handleLogOut={handleLogOut} onClose={handleCloseModal} />
				<div className="h-9"></div>
			</div>
		</div>
	);
};

export default SettingItem;
