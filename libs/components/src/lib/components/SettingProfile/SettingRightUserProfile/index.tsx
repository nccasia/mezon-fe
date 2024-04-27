import { useAccount } from '@mezon/core';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { InputField } from '@mezon/ui';
import { Modal } from 'flowbite-react';
import { useState } from 'react';
import SettingUserClanProfileCard, { Profilesform } from '../SettingUserClanProfileCard';
import { channelMembersActions, selectCurrentChannelId, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { useSelector } from 'react-redux';
import { ChannelType } from 'mezon-js';

const SettingRightUser = ({
	onClanProfileClick,
	name,
	avatar,
	nameDisplay,
	aboutMe,
}: {
	onClanProfileClick?: () => void;
	name: string;
	avatar: string;
	nameDisplay: string;
	aboutMe: string
}) => {
	
	const [editAboutUser, setEditAboutUser] = useState(aboutMe);
	const { sessionRef, clientRef } = useMezon();
	const [displayName, setDisplayName] = useState(nameDisplay);
	const [urlImage, setUrlImage] = useState(avatar);
	const { updateUser } = useAccount();
	const [flags, setFlags] = useState(true);
	const [flagsRemoveAvartar, setFlagsRemoveAvartar] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);
	const handleUpdateUser = async () => {
		if (name || urlImage || displayName || editAboutUser) {
			await updateUser(name, urlImage, displayName, editAboutUser);
			if (currentChannelId && currentClanId){
				await dispatch(channelMembersActions.fetchChannelMembers({clanId: currentClanId || '', channelId:currentChannelId || '', channelType: ChannelType.CHANNEL_TYPE_TEXT, noCache:true, repace:true }));
			}
		}
	};

	const handleFile = (e: any) => {
		const file = e.target.files && e.target.files[0];
		const fullfilename = file?.name;
		const sizeImage = file?.size;
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!file) return;
		if (!client || !session) {
			throw new Error('Client or file is not initialized');
		}

		if (sizeImage > 1000000) {
			setOpenModal(true);
			e.target.value = null;
			return;
		}
		handleUploadFile(client, session, fullfilename, file).then((attachment: any) => {
			setUrlImage(attachment.url ?? '');
		});
		setFlags(true);
	};
	const handleClose = () => {
		setDisplayName(nameDisplay);
		setEditAboutUser(aboutMe);
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
		setFlags(true); 
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
	const onchangeAboutUser = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setEditAboutUser(e.target.value);
		setFlags(true);
	};
	return (
		<div className="overflow-y-auto flex flex-col flex-1 shrink bg-bgSecondary w-1/2 pt-[94px] pb-7 pr-[10px] pl-[40px] overflow-x-hidden min-w-[700px] 2xl:min-w-[900px] max-w-[740px] hide-scrollbar">
			<div className="text-white">
				<h1 className="text-xl font-semibold tracking-wider mb-8">Profiles</h1>
				<button className="pt-1 font-semibold text-base border-b-2 border-[#1f2020] pb-2 tracking-wider">User Profile</button>
				<button className="pt-1 text-[#AEAEAE] text-base ml-[16px] font-semibold tracking-wider" onClick={handleClanProfileButtonClick}>
					Clan Profiles
				</button>
			</div>
			<div className="flex-1 flex mt-[20px] z-0 gap-x-8 flex-row">
				<div className="w-1/2 text-[#CCCCCC]">
					<div className="mt-[20px]">
						<label className="font-semibold tracking-wide text-sm">DISPLAY NAME</label>
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
						<p className="font-semibold tracking-wide text-sm">AVATAR</p>
						<div className="flex mt-[10px] gap-x-5">
							<label>
								<div
									className="text-white font-semibold bg-[#155EEF] hover:bg-blue-500 rounded-[4px] p-[8px] pr-[10px] pl-[10px] cursor-pointer text-[15px]"
									onChange={(e) => handleFile(e)}
								>
									Change avatar
								</div>
								<input type="file" onChange={(e) => handleFile(e)} className="block w-full text-sm text-slate-500 hidden" />
							</label>
							<button
								className="text-white bg-[#1E1E1E] font-semibold rounded-[4px] p-[8px] pr-[10px] pl-[10px] text-nowrap text-[15px]"
								onClick={handleRemoveButtonClick}
							>
								Remove avatar
							</button>
						</div>
						<div className='mt-[30px] w-full'>
							<textarea 
								className="bg-black rounded p-[10px] w-full"
								onChange={(e) => {
									onchangeAboutUser(e);
								}}
								value={editAboutUser}
								rows = {4}
							></textarea>
							<div className='w-full flex justify-end'>
								<span className={`text-${editAboutUser.length > 128 ? '[#EF1515]' : '[#797878]'}`}>{editAboutUser.length}/{128}</span>
							</div>
						</div>
					</div>
				</div>
				<div className="w-1/2 text-white">
					<p className="mt-[20px] text-[#CCCCCC] font-semibold tracking-wide text-sm">PREVIEW</p>
					<SettingUserClanProfileCard profiles={editProfile} />
				</div>
			</div>
			{(urlImage !== avatar && flags) || (displayName !== nameDisplay && flags) || (flagsRemoveAvartar !== false && flags) || (editAboutUser !== aboutMe && flags) ? (
				<div className="flex flex-row gap-2  bg-gray-500 absolute max-w-[815px] w-full left-1/2 translate-x-[-50%] bottom-4 min-w-96 h-fit p-3 rounded transform ">
					<div className="flex-1 flex items-center text-nowrap">
						<p className="text-[15px]">Carefull - you have unsaved changes!</p>
					</div>
					<div className="flex flex-row justify-end gap-3">
						<button
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
								handleUpdateUser(); 
								handlSaveClose();
							}}
						>
							Save Changes
						</button>
					</div>
				</div>
			) : null}
			<Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
				<Modal.Body className="bg-red-500 rounded-lg">
					<div className="space-y-6 h-52 border-dashed border-2 flex text-center justify-center flex-col">
						<img
							className="w-60 h-60 absolute top-[-130px] left-1/2 translate-x-[-50%]"
							src="/assets/images/file-and-folder.png"
							alt="file"
						/>
						<h3 className="text-white text-4xl font-semibold">Your files are too powerful</h3>
						<h4 className="text-white text-xl">Max file size is 1MB, please!</h4>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	);
};
export default SettingRightUser;
