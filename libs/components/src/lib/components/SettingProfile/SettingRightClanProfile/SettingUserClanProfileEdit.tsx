import { useAuth, useClanProfileSetting } from '@mezon/core';
import { selectUserClanProfileByClanID } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { InputField } from '@mezon/ui';
import { fileTypeImage, resizeFileImage } from '@mezon/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ModalSettingSave } from '../../ClanSettings/SettingRoleManagement';
import { ModalErrorTypeUpload, ModalOverData } from '../../ModalError';
import SettingRightClanCard from '../SettingUserClanProfileCard';
import SettingUserClanProfileSave from './SettingUserClanProfileSave';

interface SettingUserClanProfileEditProps {
	flagOption: boolean;
	setFlagOption: (flagOption: boolean) => void;
	clanId: string;
}

const SettingUserClanProfileEdit: React.FC<SettingUserClanProfileEditProps> = ({ flagOption, clanId, setFlagOption }) => {
	const { userProfile } = useAuth();
	const { sessionRef, clientRef } = useMezon();
	const userClansProfile = useSelector(selectUserClanProfileByClanID(clanId ?? '', userProfile?.user?.id ?? ''));
	const [draftProfile, setDraftProfile] = useState(userClansProfile);
	const [openModal, setOpenModal] = useState(false);
	const [openModalType, setOpenModalType] = useState(false);

	const { updateUserClanProfile } = useClanProfileSetting({ clanId });

	useEffect(() => {
		setDraftProfile(userClansProfile);
	}, [userClansProfile]);

	const setUrlImage = (url_image: string) => {
		setDraftProfile((prevState) => (prevState ? { ...prevState, avatar: url_image } : prevState));
	};
	const setDisplayName = (nick_name: string) => {
		setDraftProfile((prevState) => (prevState ? { ...prevState, nick_name } : prevState));
	};

	const editProfile = useMemo(() => {
		const profileVaile = {
			displayName: '',
			urlImage: userProfile?.user?.avatar_url ?? ''
		};
		if (draftProfile?.nick_name) {
			profileVaile.displayName = draftProfile?.nick_name;
		}
		if (draftProfile?.avatar) {
			profileVaile.urlImage = draftProfile.avatar;
		}
		return profileVaile;
	}, [draftProfile, userProfile]);

	const { displayName, urlImage } = editProfile;

	const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!clientRef.current || !sessionRef.current) throw new Error('Client or session is not initialized');
		if (!fileTypeImage.includes(file.type)) {
			setOpenModalType(true);
			e.target.value = '';
			return;
		}
		if (file.size > 1000000) {
			setOpenModal(true);
			e.target.value = '';
			return;
		}
		const imageAvatarResize = (await resizeFileImage(file, 120, 120, 'file', 80, 80)) as File;

		handleUploadFile(clientRef.current, sessionRef.current, clanId, userProfile?.user?.id || '0', imageAvatarResize.name, imageAvatarResize).then(
			(attachment) => {
				setUrlImage(attachment.url || '');
				setFlagOption(attachment.url !== userProfile?.user?.avatar_url);
			}
		);
	};
	const handleDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDisplayName(e.target.value);
		setFlagOption(e.target.value !== userClansProfile?.nick_name);
	};

	const handleRemoveButtonClick = () => {
		setFlagOption(true);
		setUrlImage(userProfile?.user?.avatar_url || '');
	};

	const handleClose = () => {
		if (userClansProfile?.nick_name || userClansProfile?.avatar) {
			setDisplayName(userClansProfile.nick_name || '');
			setUrlImage(userClansProfile.avatar || '');
		} else {
			setDisplayName(userProfile?.user?.username || '');
			setUrlImage(userProfile?.user?.avatar_url || '');
		}
		setFlagOption(false);
	};
	const handleSaveClose = () => {
		setFlagOption(false);
	};
	const handleUpdateUser = async () => {
		if (urlImage || displayName) {
			await updateUserClanProfile(userClansProfile?.clan_id ?? '', displayName || '', urlImage || '');
		}
	};
	const saveProfile: ModalSettingSave = {
		flagOption: flagOption,
		handleClose,
		handleSaveClose,
		handleUpdateUser
	};

	return (
		<>
			<div className="flex-1 flex mt-[10px] gap-x-8 sbm:flex-row flex-col">
				<div className="flex-1 dark:text-white text-black">
					<div className="mt-[20px]">
						<label htmlFor="inputField" className="dark:text-[#CCCCCC] text-black font-bold tracking-wide text-sm">
							CLAN NICKNAME
						</label>
						<br />
						<InputField
							id="inputField"
							onChange={handleDisplayName}
							type="text"
							className="rounded-[3px] w-full dark:text-white text-black border dark:border-white border-slate-200 px-4 py-2 mt-2 outline-none  dark:bg-black bg-[#f0f0f0] font-normal text-sm tracking-wide"
							placeholder={userProfile?.user?.display_name || userProfile?.user?.username}
							value={displayName}
							maxLength={32}
						/>
					</div>
					<div className="mt-[20px]">
						<p className="dark:text-[#CCCCCC] text-textLightTheme font-bold tracking-wide text-sm">AVATAR</p>
						<div className="flex mt-[10px] gap-x-5">
							<label>
								<div className="text-[14px] font-medium bg-[#155EEF] hover:bg-blue-500 rounded-[4px] p-[8px] pr-[10px] pl-[10px] cursor-pointer text-white">
									Change avatar
								</div>
								<input type="file" onChange={handleFile} className="hidden" />
							</label>
							<button
								className="bg-[#1E1E1E] rounded-[4px] p-[8px] pr-[10px] pl-[10px] text-nowrap text-[14px] font-medium text-white"
								onClick={handleRemoveButtonClick}
							>
								Remove avatar
							</button>
						</div>
					</div>
				</div>
				<div className="flex-1 text-white">
					<p className="mt-[20px] dark:text-[#CCCCCC] text-textLightTheme font-bold tracking-wide text-sm">PREVIEW</p>
					<SettingRightClanCard profiles={editProfile} currentDisplayName={!displayName ? userProfile?.user?.display_name : ''} />
				</div>
			</div>
			<SettingUserClanProfileSave PropsSave={saveProfile} />
			<ModalOverData openModal={openModal} handleClose={() => setOpenModal(false)} />
			<ModalErrorTypeUpload openModal={openModalType} handleClose={() => setOpenModalType(false)} />
		</>
	);
};
export default SettingUserClanProfileEdit;
