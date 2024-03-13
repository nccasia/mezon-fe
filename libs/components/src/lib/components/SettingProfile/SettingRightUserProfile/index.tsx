import { useAccount } from '@mezon/core';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { InputField } from '@mezon/ui';
import { useState } from 'react';
import SettingUserClanProfileCard, { Profilesform } from '../SettingUserClanProfileCard';
// import * as Icons from '../../Icons';

// import React, { useState, useEffect } from 'react';
const SettingRightUser = ({
	onClanProfileClick,
	name,
	avatar,
	nameDisplay,
}: {
	onClanProfileClick?: () => void;
	name: string;
	avatar: string;
	nameDisplay: string;
}) => {
	const [userName, setUserName] = useState(name);
	const { sessionRef, clientRef } = useMezon();
	const [displayName, setDisplayName] = useState(nameDisplay);
	const [urlImage, setUrlImage] = useState(avatar);
	const { updateUser } = useAccount();
	const [flags, setFlags] = useState(true);
	const [flagsRemoveAvartar, setFlagsRemoveAvartar] = useState(false);
	const handleUpdateUser = async () => {
		if (userName || urlImage || displayName) {
			await updateUser(userName, urlImage, displayName);
		}
	};
	const handleFile = (e: any) => {
		const file = e.target.files && e.target.files[0];
		const fullfilename = file?.name;
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!file) return;
		if (!client || !session) {
			throw new Error('Client or file is not initialized');
		}
		handleUploadFile(client, session, fullfilename, file).then((attachment: any) => {
			setUrlImage(attachment.url ?? '');
		});
		setFlags(true);
	};
	const handleClose = () => {
		setDisplayName(nameDisplay);
		setUrlImage(avatar);
		setFlags(false);
		setFlagsRemoveAvartar(false);
	};
	const handlSaveClose = () => {
		setFlags(false);
	};
	const editProfile: Profilesform = {
		displayName: displayName || '',
		urlImage: urlImage || '',
	};
	const handleDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDisplayName(e.target.value);
		setFlags(true); // Thêm dòng này để gọi setFlags(true) khi có sự thay đổi
	};

	const handleClanProfileButtonClick = () => {
		if (onClanProfileClick) {
			onClanProfileClick();
		}
	};
	const handleRemoveButtonClick = () => {
		setFlagsRemoveAvartar(true);
		setFlags(true);
		setUrlImage('');
	};
	return (
		<div className="overflow-y-auto flex flex-col flex-1 shrink bg-bgSecondary w-1/2 pt-[94px] pb-7 pr-[10px] pl-[40px] overflow-x-hidden min-w-[700px] 2xl:min-w-[900px] hide-scrollbar">
			<div className="text-white">
				<h1 className="text-xl font-bold tracking-wider mb-8">Profiles</h1>
				<button className="pt-1 font-bold text-base border-b-2 border-[#155EEF] pb-2 tracking-wider">User Profile</button>
				<button className="pt-1 text-[#AEAEAE] text-base ml-[16px] font-bold tracking-wider" onClick={handleClanProfileButtonClick}>
					Clan Profiles
				</button>
			</div>
			<div className="flex-1 flex mt-[20px] z-0 gap-x-8 flex-row">
				<div className="w-1/2 text-[#CCCCCC]">
					<div className="mt-[20px]">
						<label className="font-bold tracking-wide text-sm">DISPLAY NAME</label>
						<br />
						<InputField
							onChange={handleDisplayName}
							type="text"
							className="rounded-[3px] w-full text-white border border-black px-4 py-2 mt-2 focus:outline-none focus:border-white-500 bg-black font-normal text-sm tracking-wide"
							placeholder={displayName}
							value={displayName}
						/>
					</div>
					<div className="mt-8">
						<p className="font-bold tracking-wide text-sm">AVATAR</p>
						<div className="flex mt-[10px] gap-x-5">
							<label>
								<div
									className="text-white bg-[#155EEF] hover:bg-blue-500 rounded-[4px] p-[8px] pr-[10px] pl-[10px] cursor-pointer text-[15px]"
									onChange={(e) => handleFile(e)}
								>
									Change avatar
								</div>
								<input type="file" onChange={(e) => handleFile(e)} className="block w-full text-sm text-slate-500 hidden" />
							</label>
							<button
								className="text-white bg-[#1E1E1E] rounded-[4px] p-[8px] pr-[10px] pl-[10px] text-nowrap text-[15px]"
								onClick={handleRemoveButtonClick}
							>
								Remove avatar
							</button>
						</div>
					</div>
				</div>
				<div className="w-1/2 text-white">
					<p className="mt-[20px] text-[#CCCCCC] font-bold tracking-wide text-sm">PREVIEW</p>
					<SettingUserClanProfileCard profiles={editProfile} />
				</div>
			</div>
			{(urlImage !== avatar && flags) || (displayName !== nameDisplay && flags) || (flagsRemoveAvartar !== false && flags) ? (
				// <div className="flex items-center w-1/2 h-[50px] mt-[-90px] bg-gray-500 rounded-[8px] z-10 fixed top-[890px] pl-[20px] pr-[20px]">
				<div className="flex flex-row gap-2  bg-gray-500 absolute max-w-[815px] w-full left-1/2 translate-x-[-50%] bottom-4 min-w-96 h-fit p-3 rounded transform ">
					<div className="flex-1 flex items-center text-nowrap">
						<p className="text-[15px]">Carefull - you have unsaved changes!</p>
					</div>
					<div className="flex flex-row justify-end gap-3">
						<button
							// className="ml-[450px] bg-gray-600 rounded-[8px] p-[8px]"
							className="text-[15px] bg-gray-600 rounded-[4px] p-[8px]"
							onClick={() => {
								handleClose();
							}}
						>
							Reset
						</button>

						<button
							// className="ml-auto bg-blue-600 rounded-[8px] p-[8px]"
							className="text-[15px] bg-blue-600 rounded-[4px] p-[8px] text-nowrap"
							onClick={() => {
								handleUpdateUser(), handlSaveClose();
							}}
						>
							Save Changes
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
};
export default SettingRightUser;
