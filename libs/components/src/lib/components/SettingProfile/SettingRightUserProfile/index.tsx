import { useAccount } from '@mezon/core';
import { channelMembersActions, selectCurrentChannelId, selectCurrentClanId, selectTheme, useAppDispatch } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { InputField } from '@mezon/ui';
import { fileTypeImage, resizeFileImage } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ModalErrorTypeUpload, ModalOverData } from '../../ModalError';
import SettingUserClanProfileCard, { Profilesform } from '../SettingUserClanProfileCard';

const SettingRightUser = ({
	onClanProfileClick,
	name,
	avatar,
	nameDisplay,
	aboutMe,
	menuIsOpen,
}: {
	onClanProfileClick?: () => void;
	name: string;
	avatar: string;
	nameDisplay: string;
	aboutMe: string;
	menuIsOpen: boolean;
}) => {
	const [editAboutUser, setEditAboutUser] = useState(aboutMe);
	const { sessionRef, clientRef } = useMezon();
	const [displayName, setDisplayName] = useState(nameDisplay);
	const [urlImage, setUrlImage] = useState(avatar);
	const { updateUser } = useAccount();
	const [flags, setFlags] = useState(true);
	const [flagsRemoveAvartar, setFlagsRemoveAvartar] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [openModalType, setOpenModalType] = useState(false);
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId) || '';
	const currentClanId = useSelector(selectCurrentClanId) || '';
	const handleUpdateUser = async () => {
		if (name || urlImage || displayName || editAboutUser) {
			await updateUser(name, urlImage, displayName, editAboutUser);
			if (currentChannelId && currentClanId) {
				await dispatch(
					channelMembersActions.fetchChannelMembers({
						clanId: currentClanId || '',
						channelId: currentChannelId || '',
						channelType: ChannelType.CHANNEL_TYPE_TEXT,
						noCache: true,
						repace: true,
					}),
				);
			}
		}
	};

	const handleFile = async (e: any) => {
		const file = e?.target?.files[0];
		const sizeImage = file?.size;
		const session = sessionRef.current;
		const client = clientRef.current;
		const imageAvatarResize = (await resizeFileImage(file, 120, 120, 'file', 80, 80)) as File;
		if (!file) return;
		if (!client || !session) {
			throw new Error('Client or file is not initialized');
		}

		const allowedTypes = fileTypeImage;
		if (!allowedTypes.includes(file.type)) {
			setOpenModalType(true);
			e.target.value = null;
			return;
		}

		if (sizeImage > 1000000) {
			setOpenModal(true);
			e.target.value = null;
			return;
		}
		handleUploadFile(client, session, currentClanId || '0', currentChannelId || '0', imageAvatarResize?.name, imageAvatarResize).then((attachment: any) => {
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
	const handleSaveClose = () => {
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
	const appearanceTheme = useSelector(selectTheme);
	return (
		<div
			className={`overflow-y-auto flex flex-col flex-1 shrink dark:bg-bgPrimary bg-white w-1/2 pt-[94px] pb-7 sbm:pr-[10px] pr-[40px] pl-[40px] overflow-x-hidden ${menuIsOpen === true ? 'min-w-[700px]' : ''} 2xl:min-w-[900px] max-w-[740px] hide-scrollbar`}
		>
			<div className="dark:text-white text-black">
				<h1 className="text-xl font-semibold tracking-wider mb-8">Profiles</h1>
				<button className="pt-1 font-semibold text-base border-b-2 border-[#155EEF] pb-2 tracking-wider">User Profile</button>
				<button className="pt-1 text-[#AEAEAE] text-base ml-[16px] font-semibold tracking-wider" onClick={handleClanProfileButtonClick}>
					Clan Profiles
				</button>
			</div>
			<div className="flex-1 flex mt-[20px] z-0 gap-x-8 sbm:flex-row flex-col">
				<div className="flex-1 dark:text-[#CCCCCC] text-black">
					<div className="mt-[20px]">
						<label htmlFor="inputField" className="font-semibold tracking-wide text-sm">
							DISPLAY NAME
						</label>
						<br />
						<InputField
							id="inputField"
							onChange={handleDisplayName}
							type="text"
							className="rounded-[3px] w-full border px-4 py-2 mt-2 focus:outline-none focus:border-white-500 font-normal text-sm tracking-wide"
							placeholder={displayName}
							value={displayName}
							maxLength={32}
						/>
					</div>
					<div className="mt-8">
						<p className="font-semibold tracking-wide text-sm">AVATAR</p>
						<div className="flex mt-[10px] gap-x-5">
							<label>
								<div
									className="text-white font-medium bg-[#155EEF] hover:bg-blue-500 rounded-[4px] p-[8px] pr-[10px] pl-[10px] cursor-pointer text-[14px]"
									onChange={(e) => handleFile(e)}
								>
									Change avatar
								</div>
								<input type="file" onChange={(e) => handleFile(e)} className="w-full text-sm text-slate-500 hidden" />
							</label>
							<button
								className="dark:text-white text-black dark:bg-[#1E1E1E] bg-gray-300 font-medium rounded-[4px] p-[8px] pr-[10px] pl-[10px] text-nowrap text-[14px]"
								onClick={handleRemoveButtonClick}
							>
								Remove avatar
							</button>
						</div>
						<div className="mt-[30px] w-full">
							<textarea
								className={`dark:bg-bgTertiary bg-[#F0F0F0] rounded p-[10px] w-full outline-none ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
								onChange={(e) => {
									onchangeAboutUser(e);
								}}
								value={editAboutUser}
								rows={4}
								maxLength={128}
							></textarea>
							<div className="w-full flex justify-end">
								<span className={`text-${editAboutUser.length > 128 ? '[#EF1515]' : '[#797878]'}`}>
									{editAboutUser.length}/{128}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className="flex-1  text-white">
					<p className="mt-[20px] dark:text-[#CCCCCC] text-black font-semibold tracking-wide text-sm">PREVIEW</p>
					<SettingUserClanProfileCard profiles={editProfile} />
				</div>
			</div>
			{(urlImage !== avatar && flags) ||
			(displayName !== nameDisplay && flags) ||
			(flagsRemoveAvartar !== false && flags) ||
			(editAboutUser !== aboutMe && flags) ? (
				<div className="flex flex-row gap-2  bg-gray-500 absolute max-w-[815px] w-full left-1/2 translate-x-[-50%] bottom-4 min-w-96 h-fit p-3 rounded transform z-10">
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
							className="text-[15px] bg-blue-600 rounded-[4px] p-[8px] text-nowrap"
							onClick={() => {
								handleUpdateUser();
								handleSaveClose();
							}}
						>
							Save Changes
						</button>
					</div>
				</div>
			) : null}

			<ModalOverData openModal={openModal} handleClose={() => setOpenModal(false)} />

			<ModalErrorTypeUpload openModal={openModalType} handleClose={() => setOpenModalType(false)} />
		</div>
	);
};
export default SettingRightUser;
