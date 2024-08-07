import { useAppNavigation, useDirect, useMemberCustomStatus, useOnClickOutside } from '@mezon/core';
import { notificationActions, selectFriendStatus, selectMemberByUserId, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { INotification } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { OpenModalProps } from '../ModalUserProfile';
import AvatarProfile from '../ModalUserProfile/AvatarProfile';
import GroupIconBanner from '../ModalUserProfile/StatusProfile/groupIconBanner';
import { getColorAverageFromURL } from '../SettingProfile/AverageColor';
import AboutMe from './AboutMe';
import Activity from './Activity';
import MutualFriends from './MutualFriends';
import MutualServers from './MutualServers';
import ProfileTabs, { typeTab } from './ProfileTabs';

type UserProfileModalInnerProps = {
	openModal: boolean;
	onClose?: () => void;
	userId?: string;
	notify?: INotification;
};

const initOpenModal = {
	openFriend: false,
	openOption: false,
};

const UserProfileModalInner = ({ openModal, userId, notify, onClose }: UserProfileModalInnerProps) => {
	const dispatch = useAppDispatch();
	const userProfileRef = useRef<HTMLDivElement | null>(null);
	const userById = useSelector(selectMemberByUserId(userId ?? ''));
	const checkAddFriend = useSelector(selectFriendStatus(userById?.user?.id || ''));
	const userCustomStatus = useMemberCustomStatus(userId || '');
	const [openGroupIconBanner, setGroupIconBanner] = useState<OpenModalProps>(initOpenModal);
	const [activeTab, setActiveTab] = useState<string>(typeTab.ABOUT_ME);
	const [color, setColor] = useState<string>('');
	const { createDirectMessageWithUser } = useDirect();
	const { toDmGroupPageFromMainApp, navigate } = useAppNavigation();

	const directMessageWithUser = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response.channel_id) {
			const directChat = toDmGroupPageFromMainApp(response.channel_id, Number(response.type));
			await navigate('/' + directChat);
			onClose?.();
			dispatch(notificationActions.setIsShowInbox(false));
		}
	};

	const handleActiveTabChange = (tabId: string) => {
		setActiveTab(tabId);
	};

	const checkUrl = (url: string | undefined) => {
		if (url !== undefined && url !== '') return true;
		return false;
	};

	useEffect(() => {
		const getColor = async () => {
			if (checkUrl(userById?.user?.avatar_url)) {
				const url = userById?.user?.avatar_url;
				const colorImg = await getColorAverageFromURL(url || '');
				if (colorImg) setColor(colorImg);
			}
		};

		getColor();
	}, [userById?.user?.avatar_url]);

	useOnClickOutside(userProfileRef, () => onClose?.());
	return (
		<div className="w-[100vw] h-[100vh] fixed top-0 left-0 z-50 bg-black bg-opacity-80 flex flex-row justify-center items-center dark:text-contentTertiary text-black">
			<div
				ref={userProfileRef}
				className="w-[600px] h-[90vh] dark:bg-bgPrimary bg-bgLightModeThird rounded-lg flex-col justify-start items-start inline-flex"
			>
				<div
					className={`relative flex justify-end w-full h-[210px] rounded-t-md ${!color && 'dark:bg-bgAvatarDark bg-bgAvatarLight'}`}
					style={{ backgroundColor: color }}
					onClick={() => setGroupIconBanner(initOpenModal)}
				>
					<div className={`rounded-tl-lg rounded-tr-lg h-[60px] flex justify-end gap-x-2 p-2 `}>
						<GroupIconBanner
							checkAddFriend={checkAddFriend}
							openModal={openGroupIconBanner}
							setOpenModal={setGroupIconBanner}
							user={userById}
						/>
					</div>
					<div className="flex absolute bottom-[-60px] w-full">
						<AvatarProfile
							avatar={userById?.user?.avatar_url}
							username={userById?.user?.username || notify?.content?.username}
							userToDisplay={userById}
							customStatus={userCustomStatus}
							styleAvatar="w-[120px] h-[120px] rounded-full"
						/>
						<div className="flex items-end pr-4">
							<button
								onClick={() => directMessageWithUser(userId || '')}
								className="flex items-center h-8 px-4 rounded-[3px] dark:bg-buttonProfile bg-buttonMessageHover dark:hover:bg-buttonMessageHover hover:bg-buttonProfile"
							>
								<Icons.MessageIcon className="text-bgLightPrimary" />
								<span className="text-sm text-bgLightPrimary font-semibold">Message</span>
							</button>
						</div>
					</div>
				</div>
				<div className="dark:bg-bgProfileBody bg-bgLightPrimary pt-[60px] pb-4 px-4 rounded-b-md w-full flex-1">
					<div className="flex flex-col gap-3 h-full">
						<div className="mt-4">
							<h3 className="text-2xl font-semibold">
								{userById?.clan_nick || userById?.user?.display_name || userById?.user?.username || notify?.content?.username}
							</h3>
							<p className="text-sm font-normal">{userById?.user?.username || notify?.content?.username}</p>
						</div>
						<div className="flex-1 dark:bg-bgSearchHover bg-bgLightSearchHover rounded-lg shadow-shadowInbox">
							<ProfileTabs activeTab={activeTab} onActiveTabChange={handleActiveTabChange} />
							<div className="p-4">
								{activeTab === typeTab.ABOUT_ME && <AboutMe createTime={userById?.user?.create_time} />}
								{activeTab === typeTab.ACTIVITY && <Activity />}
								{activeTab === typeTab.MUTUAL_FRIENDS && <MutualFriends />}
								{activeTab === typeTab.MUTUAL_SERVERS && <MutualServers />}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfileModalInner;
