import { useClans } from '@mezon/core';
import React, { FormEvent, MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DeleteClanModalProps {
	onClose: () => void;
}

const DeleteClanModal: React.FC<DeleteClanModalProps> = ({ onClose }) => {
	const {deleteClan, currentClanId, currentClan} = useClans();
	const [inputValue, setInputValue] = useState('');
	const [inputValueIsMatchClanName, setInputValueIsMatchClanName] = useState(true);
	const navigate = useNavigate();
	const handleDeleteCurrentClan = async(e: FormEvent<HTMLFormElement> | MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		if(inputValue === currentClan?.clan_name){
			await deleteClan({clanId: currentClanId || ""});
			navigate("/");
		}else{
			setInputValueIsMatchClanName(false);
		}
	}
	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 ">
			<div className="fixed inset-0 bg-black opacity-80"></div>
			<form className="relative z-10 dark:bg-[#313338] bg-bgLightModeSecond rounded-[5px]" onSubmit={handleDeleteCurrentClan}>
				<div className="top-block p-[16px] dark:text-textDarkTheme text-textLightTheme flex flex-col gap-[15px]">
					<div className="text-xl font-semibold">Delete '{currentClan?.clan_name}'</div>
					<div className="bg-[#f0b132] rounded-sm p-[10px]">Are you sure you want to delete this clan? This action cannot be undone.</div>
					<div className="mb-[15px]">
						<div className="dark:text-[#b1b5bc] text-textLightTheme text-base">Enter clan name</div>
						<input
							type="text"
							className="w-full dark:bg-[#1e1f22] bg-[#dddcdc] dark:text-textDarkTheme text-textLightTheme rounded-[5px] outline-none p-[10px] my-[7px]"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
						/>
						{!inputValueIsMatchClanName ? <div className='text-[#fa777c] text-xs font-semibold'>You didn't enter the clan name correctly</div> : ""}
					</div>
				</div>
				<div className="bottom-block flex justify-end p-[16px] dark:bg-[#2b2d31] bg-[#e1dfdf] items-center gap-[20px] font-semibold rounded-[5px]">
					<div onClick={onClose} className="dark:text-textDarkTheme text-textLightTheme cursor-pointer hover:underline">
						Cancel
					</div>
					<div onClick={handleDeleteCurrentClan} className="bg-[#da373c] hover:bg-[#a12828] rounded-md px-4 py-2 cursor-pointer">Delete clan</div>
				</div>
			</form>
		</div>
	);
};

export default DeleteClanModal;
