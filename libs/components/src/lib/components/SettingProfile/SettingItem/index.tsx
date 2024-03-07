import { authActions, useAppDispatch } from '@mezon/store';
import { LogoutModal } from 'libs/ui/src/lib/LogOutButton';
import { useState } from 'react';
const SettingItem = ({ onItemClick }: { onItemClick?: (settingName: string) => void }) => {
	const [selectedButton, setSelectedButton] = useState<string | null>('Account');
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
		<div className=" overflow-y-auto w-1/6 xl:w-1/4 min-w-56 bg-black flex justify-end pt-96 pr-2 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-200 2xl:flex-grow">
			<div className="w-170px ">
				<p className="text-[#84ADFF] font-bold text-sm tracking-wider">USER SETTINGS</p>
				<button
					className={`text-[#AEAEAE] w-[170px] text-[15px] rounded-[5px] text-left ml-[-8px] p-2 mt-4 transition-all duration-300 hover:bg-bgButtonHover ${selectedButton === 'Account' ? 'bg-blue-400 text-white' : ''}`}
					onClick={() => {
						handleButtonClick('Account');
						onItemClick && onItemClick('Account');
					}}
				>
					My Account
				</button>
				<br />
				<button
					className={`p-2 text-[#AEAEAE] text-[15px] pl-2 ml-[-8px] ${selectedButton === 'Profiles' ? 'bg-blue-400 text-white' : ''} mt-1 w-[170px] text-left rounded-[5px]`}
					onClick={() => {
						handleButtonClick('Profiles');
						onItemClick && onItemClick('Profiles');
					}}
				>
					Profiles
				</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Privacy & Safety</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Family Center</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Family Center</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Authorized Apps</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Devices</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Connections</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Clips</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] mb-[10px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Friend Requests</button>
				<hr className="border-t border-solid border-borderDefault mt-4" />
				<button className="pt-2 text-[#84ADFF] mt-4 font-bold text-sm tracking-wider">APP SETTINGS</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-4 ml-[-8px]">Appearance</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Accessibility</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Voice & Video</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Text & Image</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Notifications</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Keybinds</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Language</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Streamer Mode</button>
				<br />
				<button className="p-2 text-[#AEAEAE] text-[15px] w-[170px] rounded-[5px] text-left mt-1 ml-[-8px]">Advanced</button>
				<br />
				<button
					className={`p-2 text-[#AEAEAE] text-[15px] ${selectedButton === 'Log Out' ? 'bg-blue-400' : ''} mt-1 w-[170px] text-left rounded-[5px] ml-[-8px]`}
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
