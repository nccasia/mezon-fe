import { useAuth, useMemberCustomStatus, useSettingFooter } from '@mezon/core';
import {
	ChannelsEntity,
	channelMembersActions,
	selectAccountCustomStatus,
	selectCurrentClanId,
	selectShowModalCustomStatus,
	selectShowModalFooterProfile,
	selectTheme,
	useAppDispatch,
	userClanProfileActions
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { MemberProfileType } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { memo, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { MemberProfile } from '../MemberProfile';
import ModalCustomStatus from '../ModalUserProfile/StatusProfile/ModalCustomStatus';
import ModalFooterProfile from './ModalFooterProfile';

export type FooterProfileProps = {
	name: string;
	status?: boolean;
	avatar: string;
	userId?: string;
	channelCurrent?: ChannelsEntity | null;
	isDM: boolean;
};

function FooterProfile({ name, status, avatar, userId, isDM }: FooterProfileProps) {
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const showModalFooterProfile = useSelector(selectShowModalFooterProfile);
	const showModalCustomStatus = useSelector(selectShowModalCustomStatus);
	const appearanceTheme = useSelector(selectTheme);
	const userStatusProfile = useSelector(selectAccountCustomStatus);
	const userCustomStatus = useMemberCustomStatus(userId || '', isDM);
	const [customStatus, setCustomStatus] = useState<string>(userCustomStatus ?? '');

	const handleClickFooterProfile = () => {
		dispatch(userClanProfileActions.setShowModalFooterProfile(!showModalFooterProfile));
	};

	const handleCloseModalCustomStatus = () => {
		dispatch(userClanProfileActions.setShowModalCustomStatus(false));
	};

	const { setIsShowSettingFooterStatus } = useSettingFooter();
	const openSetting = () => {
		setIsShowSettingFooterStatus(true);
	};

	const handleSaveCustomStatus = () => {
		dispatch(channelMembersActions.updateCustomStatus({ clanId: currentClanId ?? '', customStatus: customStatus }));
		handleCloseModalCustomStatus();
	};

	const myProfile = useAuth();
	const isMe = useMemo(() => {
		return userId === myProfile.userId;
	}, [myProfile.userId, userId]);

	const rootRef = useRef<HTMLButtonElement>(null);

	return (
		<>
			<button
				ref={rootRef}
				className={`flex items-center justify-between px-4 py-2 font-title text-[15px]
			 font-[500] text-white hover:bg-gray-550/[0.16]
			 shadow-sm transition dark:bg-bgSecondary600 bg-channelTextareaLight
			 w-full group focus-visible:outline-none footer-profile ${appearanceTheme === 'light' && 'lightMode'}`}
			>
				<div className={`footer-profile min-w-[142px] ${appearanceTheme === 'light' && 'lightMode'}`} onClick={handleClickFooterProfile}>
					<div className="pointer-events-none">
						<MemberProfile
							name={name}
							status={{ status: isMe ? true : status, isMobile: false }}
							avatar={avatar}
							isHideStatus={false}
							classParent="memberProfile"
							positionType={MemberProfileType.FOOTER_PROFILE}
							customStatus={userStatusProfile}
						/>
					</div>
					{showModalFooterProfile && (
						<ModalFooterProfile
							userId={userId ?? ''}
							avatar={avatar}
							name={name}
							isDM={isDM}
							userStatusProfile={userStatusProfile}
							rootRef={rootRef}
						/>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Icons.MicIcon className="ml-auto w-[18px] h-[18px] opacity-80 text-[#f00] dark:hover:bg-[#5e5e5e] hover:bg-bgLightModeButton hidden" />
					<Icons.HeadPhoneICon className="ml-auto w-[18px] h-[18px] opacity-80 dark:text-[#AEAEAE] text-black  dark:hover:bg-[#5e5e5e] hover:bg-bgLightModeButton hidden" />
					<Tooltip content="Settings" trigger="hover" animation="duration-500" style={appearanceTheme === 'light' ? 'light' : 'dark'}>
						<div
							onClick={openSetting}
							className="ml-auto p-1 opacity-80 dark:text-[#AEAEAE] text-black dark:hover:bg-[#5e5e5e] hover:bg-bgLightModeButton hover:rounded-md"
						>
							<Icons.SettingProfile className="w-5 h-5" />
						</div>
					</Tooltip>
				</div>
			</button>
			{showModalCustomStatus && (
				<ModalCustomStatus
					setCustomStatus={setCustomStatus}
					customStatus={userCustomStatus || ''}
					handleSaveCustomStatus={handleSaveCustomStatus}
					name={name}
					openModal={showModalCustomStatus}
					onClose={handleCloseModalCustomStatus}
				/>
			)}
		</>
	);
}

export default memo(FooterProfile);
