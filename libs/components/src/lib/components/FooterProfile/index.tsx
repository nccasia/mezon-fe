import { useAuth, useOnClickOutside, useVoice } from '@mezon/core';
import {
	ChannelsEntity,
	selectMemberByUserId,
	selectShowModalCustomStatus,
	selectShowModalFooterProfile,
	selectTheme,
	useAppDispatch,
	userClanProfileActions,
	voiceActions,
} from '@mezon/store';
import { Tooltip } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { HeadPhoneICon, MicIcon, SettingProfile } from '../Icons';
import MemberProfile from '../MemberProfile';
import ModalCustomStatus from '../ModalUserProfile/StatusProfile/ModalCustomStatus';
import ModalFooterProfile from './ModalFooterProfile';

export type FooterProfileProps = {
	name: string;
	status?: boolean;
	avatar: string;
	userId?: string;
	openSetting: () => void;
	channelCurrent?: ChannelsEntity | null;
};

function FooterProfile({ name, status, avatar, userId, openSetting, channelCurrent }: FooterProfileProps) {
	const dispatch = useAppDispatch();
	const showModalFooterProfile = useSelector(selectShowModalFooterProfile);
	const showModalCustomStatus = useSelector(selectShowModalCustomStatus);
	const appearanceTheme = useSelector(selectTheme);

	const profileRef = useRef<HTMLDivElement | null>(null);

	const checkTypeChannel = channelCurrent?.type === ChannelType.CHANNEL_TYPE_VOICE;

	useEffect(() => {
		if (checkTypeChannel) {
			dispatch(voiceActions.setStatusCall(checkTypeChannel));
		}
	}, [channelCurrent?.type]);

	const handleClickFooterProfile = () => {
		dispatch(userClanProfileActions.setShowModalFooterProfile(!showModalFooterProfile));
	};

	const handleCloseModalFooterProfile = () => {
		dispatch(userClanProfileActions.setShowModalFooterProfile(false));
	};

	const handleCloseModalCustomStatus = () => {
		dispatch(userClanProfileActions.setShowModalCustomStatus(false));
	};

	useOnClickOutside(profileRef, handleCloseModalFooterProfile);
	
	return (
		<>
			<button
				className={`flex items-center justify-between border-t
			 dark:border-borderDefault border-white px-4 py-2 font-title text-[15px]
			 font-[500] text-white hover:bg-gray-550/[0.16]
			 shadow-sm transition dark:bg-bgSecondary600 bg-channelTextareaLight
			 w-full group focus-visible:outline-none footer-profile ${appearanceTheme === 'light' && 'lightMode'}`}
			>
				<div className={`footer-profile ${appearanceTheme === 'light' && 'lightMode'}`} ref={profileRef} onClick={handleClickFooterProfile}>
					<div className="pointer-events-none">
						<MemberProfile
							name={name}
							status={status}
							avatar={avatar}
							isHideStatus={false}
							numberCharacterCollapse={15}
							classParent="memberProfile"
						/>
					</div>
					{showModalFooterProfile && <ModalFooterProfile userId={userId ?? ''} />}
				</div>
				<div className="flex items-center gap-2">
					<MicIcon className="ml-auto w-[18px] h-[18px] opacity-80 text-[#f00] dark:hover:bg-[#5e5e5e] hover:bg-bgLightModeButton hidden" />
					<HeadPhoneICon className="ml-auto w-[18px] h-[18px] opacity-80 dark:text-[#AEAEAE] text-black  dark:hover:bg-[#5e5e5e] hover:bg-bgLightModeButton hidden" />
					<Tooltip content="Settings" trigger="hover" animation="duration-500" style={appearanceTheme === 'light' ? 'light' : 'dark'}>
						<SettingProfile
							className="ml-auto w-[18px] h-[18px] opacity-80 dark:text-[#AEAEAE] text-black dark:hover:bg-[#5e5e5e] hover:bg-bgLightModeButton"
							onClick={openSetting}
						/>
					</Tooltip>
				</div>
			</button>
			{showModalCustomStatus && <ModalCustomStatus name={name} openModal={showModalCustomStatus} onClose={handleCloseModalCustomStatus} />}
		</>
	);
}

export default FooterProfile;
