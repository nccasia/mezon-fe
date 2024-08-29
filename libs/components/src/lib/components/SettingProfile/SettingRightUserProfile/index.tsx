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
	currentDisplayName,
	aboutMe
}: {
	onClanProfileClick?: () => void;
	name: string;
	avatar: string;
	currentDisplayName: string;
	aboutMe: string;
}) => {
	const [editAboutUser, setEditAboutUser] = useState(aboutMe);
	const { sessionRef, clientRef } = useMezon();

	const [urlImage, setUrlImage] = useState(avatar);
	const { updateUser } = useAccount();
	const [flags, setFlags] = useState(true);
	const [flagsRemoveAvartar, setFlagsRemoveAvartar] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [openModalType, setOpenModalType] = useState(false);
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId) || '';
	const currentClanId = useSelector(selectCurrentClanId) || '';

	const [valueDisplayName, setValueDisplayName] = useState<string>(currentDisplayName || '');

	const handleUpdateUser = async () => {
		if (name || urlImage || valueDisplayName || editAboutUser) {
			await updateUser(name, urlImage, valueDisplayName, editAboutUser);
			if (currentChannelId && currentClanId) {
				await dispatch(
					channelMembersActions.fetchChannelMembers({
						clanId: currentClanId || '',
						channelId: currentChannelId || '',
						channelType: ChannelType.CHANNEL_TYPE_TEXT,
						noCache: true,
						repace: true
					})
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
		handleUploadFile(client, session, currentClanId || '0', currentChannelId || '0', imageAvatarResize?.name, imageAvatarResize).then(
			(attachment: any) => {
				setUrlImage(attachment.url ?? '');
			}
		);
		setFlags(true);
	};
	const handleClose = () => {
		setValueDisplayName(currentDisplayName);
		setEditAboutUser(aboutMe);
		setUrlImage(avatar);
		setFlags(false);
		setFlagsRemoveAvartar(false);
	};
	const handleSaveClose = () => {
		setFlags(false);
	};
	const editProfile: Profilesform = {
		displayName: valueDisplayName || '',
		urlImage: urlImage || ''
	};
	const handleDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValueDisplayName(e.target.value);
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
		setUrlImage(process.env.NX_LOGO_MEZON || '');
	};
	const onchangeAboutUser = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setEditAboutUser(e.target.value);
		setFlags(true);
	};
	const appearanceTheme = useSelector(selectTheme);
	return (
		<>
			<div className="flex-1 flex z-0 gap-x-8 sbm:flex-row flex-col">
				<div className="flex-1 dark:text-[#CCCCCC] text-black">
					<div>
						<label htmlFor="inputField" className="font-semibold tracking-wide text-sm">
							DISPLAY NAME
						</label>
						<br />
						<InputField
							id="inputField"
							onChange={handleDisplayName}
							type="text"
							className="bg-bgTertiary rounded-[3px] w-full px-4 py-2 mt-2 focus:outline-none font-normal text-sm tracking-wide"
							placeholder={valueDisplayName || name}
							value={valueDisplayName}
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
			(valueDisplayName !== currentDisplayName && flags) ||
			(flagsRemoveAvartar !== false && flags) ||
			(editAboutUser !== aboutMe && flags) ? (
				<div className="flex flex-row gap-2  bg-gray-500 absolute max-w-[815px] w-full left-1/2 translate-x-[-50%] bottom-4 min-w-96 h-fit p-3 rounded transform z-10">
					<div className="flex-1 flex items-center text-nowrap">
						<p className="text-[15px]">Careful - you have unsaved changes!</p>
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
		</>
	);
};
export default SettingRightUser;
