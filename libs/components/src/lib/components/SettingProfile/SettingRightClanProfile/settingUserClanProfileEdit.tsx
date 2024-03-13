import { useAuth, useClanProfileSetting } from '@mezon/core';
import { selectUserClanProfileByClanID } from '@mezon/store';
import { InputField } from '@mezon/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import SettingRightClanCard, { Profilesform } from '../SettingUserClanProfileCard';
import SettingUserClanProfileSave, { ModalSettingSave } from './settingUserClanProfileSave';

const SettingRightClanEdit = ({
	flagOption,
	setFlagOptionsTrue,
	setFlagOptionsfalse,
	clanId,
}: {
	flagOption: boolean;
	setFlagOptionsTrue?: () => void;
	setFlagOptionsfalse?: () => void;
	clanId: string;
}) => {
	const { userProfile } = useAuth();

	const userClansProfile = useSelector(selectUserClanProfileByClanID(clanId || '', userProfile?.user?.id || ''));
	const [draftProfile, setDraftProfile] = useState(userClansProfile);

	useEffect(() => {
		setDraftProfile(userClansProfile);
	}, [userClansProfile]);

	const setUrlImage = (url_image: string) => {
		setDraftProfile((prevState) => {
			if (!prevState) {
				return prevState;
			}
			return {
				...prevState,
				avartar: url_image,
			};
		});
	};
	const setDisplayName = (nick_name: string) => {
		setDraftProfile((prevState) => {
			if (!prevState) {
				return prevState;
			}
			return {
				...prevState,
				nick_name,
			};
		});
	};

	const editProfile = useMemo<Profilesform>(() => {
		const profileVaile = {
			displayName: userProfile?.user?.username || '',
			urlImage: userProfile?.user?.avatar_url || '',
		};
		if (draftProfile?.nick_name) {
			profileVaile.displayName = draftProfile?.nick_name;
		}
		if (draftProfile?.avartar) {
			profileVaile.urlImage = draftProfile.avartar;
		}
		return profileVaile;
	}, [draftProfile, userProfile]);

	const { displayName, urlImage } = editProfile;

	const { updateUserClanProfile } = useClanProfileSetting({ clanId });

	const handleFile = (e: any) => {
		const fileToStore: File = e.target.files[0];
		const newUrl = URL.createObjectURL(fileToStore);
		setUrlImage(newUrl);
		if (newUrl !== userProfile?.user?.avatar_url) {
			setFlagOptionsTrue?.();
		} else {
			setFlagOptionsfalse?.();
		}
	};
	const handleDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDisplayName(e.target.value);
		if (e.target.value !== userProfile?.user?.username) {
			setFlagOptionsTrue?.();
		} else {
			setFlagOptionsfalse?.();
		}
	};

	const handleRemoveButtonClick = () => {
		setFlagOptionsTrue?.();
		setUrlImage(userProfile?.user?.avatar_url || '');
	};

	const handleClose = () => {
		if (userClansProfile?.nick_name !== undefined || userClansProfile?.avartar !== undefined) {
			setDisplayName(userClansProfile.nick_name || '');
			setUrlImage(userClansProfile.avartar || '');
		} else {
			setDisplayName(userProfile?.user?.username || '');
			setUrlImage(userProfile?.user?.avatar_url || '');
		}
		setFlagOptionsfalse?.();
	};
	const handlSaveClose = () => {
		setFlagOptionsfalse?.();
	};
	const handleUpdateUser = async () => {
		if (urlImage || displayName) {
			await updateUserClanProfile(userClansProfile?.clan_id || '', displayName || '', urlImage || '');
		}
	};
	const saveProfile: ModalSettingSave = {
		flagOption: flagOption,
		handleClose,
		handlSaveClose,
		handleUpdateUser,
	};
	return (
		<>
			<div className="flex-1 flex mt-[10px] gap-x-8 flex-row">
				<div className="w-1/2 text-white">
					<div className="mt-[20px]">
						<label className="text-[#CCCCCC] font-bold tracking-wide text-sm">CLAN NICKNAME</label>
						<br />
						<InputField
							onChange={handleDisplayName}
							type="text"
							className="rounded-[3px] w-full text-white border border-black px-4 py-2 mt-2 focus:outline-none focus:border-white-500 bg-black font-normal text-sm tracking-wide"
							placeholder={displayName}
							value={displayName}
						/>
					</div>
					<div className="mt-[20px]">
						<p className="text-[#CCCCCC] font-bold tracking-wide text-sm">AVATAR</p>
						<div className="flex mt-[10px] gap-x-5">
							<label>
								<div
									className="text-[15px] bg-[#155EEF] hover:bg-blue-500 rounded-[4px] p-[8px] pr-[10px] pl-[10px] cursor-pointer"
									onChange={(e) => handleFile(e)}
								>
									Change avatar
								</div>
								<input type="file" onChange={(e) => handleFile(e)} className="block w-full text-sm text-slate-500 hidden" />
							</label>
							<button
								className="bg-[#1E1E1E] rounded-[4px] p-[8px] pr-[10px] pl-[10px] text-nowrap text-[15px]"
								onClick={handleRemoveButtonClick}
							>
								Remove avatar
							</button>
						</div>
					</div>
				</div>
				<div className="w-1/2 text-white">
					<p className="mt-[20px] text-[#CCCCCC] font-bold tracking-wide text-sm">PREVIEW</p>
					<SettingRightClanCard profiles={editProfile} />
				</div>
			</div>
			<SettingUserClanProfileSave PropsSave={saveProfile} />
		</>
	);
};
export default SettingRightClanEdit;
