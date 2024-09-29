import { useAppNavigation, useDirect, useFormatDate, useMemberCustomStatus, useSendInviteMessage, useSettingFooter } from '@mezon/core';
import { selectAllAccount, selectFriendStatus, selectMemberClanByUserId } from '@mezon/store';
import { ChannelMembersEntity, IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getColorAverageFromURL } from '../SettingProfile/AverageColor';
import AvatarProfile from './AvatarProfile';
import NoteUserProfile from './NoteUserProfile';
import RoleUserProfile from './RoleUserProfile';
import StatusProfile from './StatusProfile';
import GroupIconBanner from './StatusProfile/groupIconBanner';
import UserDescription from './UserDescription';
import PendingFriend from './pendingFriend';

const NX_CHAT_APP_ANNONYMOUS_USER_ID = process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID || 'anonymous';

type ModalUserProfileProps = {
	userID?: string;
	isFooterProfile?: boolean;
	classWrapper?: string;
	classBanner?: string;
	hiddenRole?: boolean;
	showNote?: boolean;
	message?: IMessageWithUser;
	showPopupLeft?: boolean;
	mode?: number;
	avatar?: string;
	positionType?: string;
	name?: string;
	status?: boolean;
	user?: ChannelMembersEntity;
	isDM?: boolean;
	userStatusProfile?: string;
};

export type OpenModalProps = {
	openFriend: boolean;
	openOption: boolean;
};

enum ETileDetail {
	AboutMe = 'About me',
	MemberSince = 'Member Since'
}

const ModalUserProfile = ({
	userID,
	isFooterProfile,
	classWrapper,
	classBanner,
	hiddenRole,
	showNote,
	message,
	showPopupLeft,
	mode,
	avatar,
	positionType,
	name,
	isDM,
	userStatusProfile
}: ModalUserProfileProps) => {
	const userProfile = useSelector(selectAllAccount);
	const { createDirectMessageWithUser } = useDirect();
	const { sendInviteMessage } = useSendInviteMessage();
	const userCustomStatus = useMemberCustomStatus(userID || '', isDM);
	const userById = useSelector(selectMemberClanByUserId(userID ?? '')) as ChannelMembersEntity;
	const date = new Date(userById?.user?.create_time as string | Date);
	const { timeFormatted } = useFormatDate({ date });

	const [content, setContent] = useState<string>('');

	const initOpenModal = {
		openFriend: false,
		openOption: false
	};
	const [openModal, setOpenModal] = useState<OpenModalProps>(initOpenModal);

	const { toDmGroupPageFromMainApp, navigate } = useAppNavigation();

	const sendMessage = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response.channel_id) {
			const channelMode = ChannelStreamMode.STREAM_MODE_DM;
			sendInviteMessage(content, response.channel_id, channelMode);
			setContent('');
			const directChat = toDmGroupPageFromMainApp(response.channel_id, Number(response.type));
			navigate('/' + directChat);
		}
	};
	const handleContent = (e: React.ChangeEvent<HTMLInputElement>) => {
		setContent(e.target.value);
	};
	const checkOwner = (userId: string) => {
		return userId === userProfile?.user?.google_id;
	};

	const checkUrl = (url: string | undefined) => {
		if (url !== undefined && url !== '') return true;
		return false;
	};
	const [color, setColor] = useState<string>('');

	useEffect(() => {
		const getColor = async () => {
			if ((isFooterProfile && checkUrl(userProfile?.user?.avatar_url)) || checkUrl(message?.avatar) || checkUrl(userById?.user?.avatar_url)) {
				const url = userById?.user?.avatar_url;
				const colorImg = await getColorAverageFromURL(url || '');
				if (colorImg) setColor(colorImg);
			}
		};

		getColor();
	}, [userProfile?.user?.avatar_url, isFooterProfile, userID, message?.avatar, userById?.user?.avatar_url]);
	const checkAddFriend = useSelector(selectFriendStatus(userById?.user?.id || ''));
	const checkUser = useMemo(() => userProfile?.user?.id === userID, [userID, userProfile?.user?.id]);
	const checkAnonymous = useMemo(() => message?.sender_id === NX_CHAT_APP_ANNONYMOUS_USER_ID, [message?.sender_id]);

	const { setIsShowSettingFooterStatus, setIsShowSettingFooterInitTab } = useSettingFooter();
	const openSetting = () => {
		setIsShowSettingFooterStatus(true);
		setIsShowSettingFooterInitTab('Profiles');
	};

	return (
		<div className={classWrapper} onClick={() => setOpenModal(initOpenModal)}>
			<div
				className={`${classBanner ? classBanner : 'rounded-tl-lg rounded-tr-lg h-[105px]'} ${!color && 'dark:bg-bgAvatarDark bg-bgAvatarLight'} flex justify-end gap-x-2 p-2 `}
				style={{ backgroundColor: color }}
			>
				{!checkUser && !checkAnonymous && (
					<GroupIconBanner
						checkAddFriend={checkAddFriend}
						openModal={openModal}
						setOpenModal={setOpenModal}
						user={userById}
						showPopupLeft={showPopupLeft}
						kichUser={message?.user}
					/>
				)}
			</div>
			<AvatarProfile
				avatar={avatar || userById?.user?.avatar_url}
				username={(isFooterProfile && userProfile?.user?.username) || message?.username || userById?.user?.username}
				userToDisplay={isFooterProfile ? userProfile : userById}
				customStatus={userCustomStatus}
				isAnonymous={checkAnonymous}
				userID={userID}
				positionType={positionType}
				isFooterProfile={isFooterProfile}
			/>
			<div className="px-[16px]">
				<div className="dark:bg-bgPrimary bg-white w-full p-2 my-[16px] dark:text-white text-black rounded-[10px] flex flex-col text-justify">
					<div>
						<p className="font-semibold tracking-wider text-xl one-line my-0">
							{checkAnonymous ? 'Anonymous' : userById?.clan_nick || userById?.user?.display_name || userById?.user?.username}
						</p>
						<p className="font-medium tracking-wide text-sm my-0">
							{isFooterProfile
								? userProfile?.user?.username
								: userById
									? userById?.user?.username
									: checkAnonymous
										? 'Anonymous'
										: message?.username}
						</p>
					</div>

					{checkAddFriend.myPendingFriend && !showPopupLeft && <PendingFriend user={userById} />}

					{mode !== 4 && mode !== 3 && !isFooterProfile && (
						<UserDescription title={ETileDetail.AboutMe} detail={userById?.user?.about_me as string} />
					)}
					{mode !== 4 && mode !== 3 && !isFooterProfile && <UserDescription title={ETileDetail.MemberSince} detail={timeFormatted} />}
					{isFooterProfile ? (
						<StatusProfile userById={userById} isDM={isDM} />
					) : (
						mode !== 4 && mode !== 3 && !hiddenRole && userById && <RoleUserProfile userID={userID} />
					)}

					{!checkOwner(userById?.user?.google_id || '') && !hiddenRole && !checkAnonymous ? (
						<div className="w-full items-center mt-2">
							<input
								type="text"
								className="w-full border dark:border-bgDisable rounded-[5px] dark:bg-bgTertiary bg-bgLightModeSecond p-[5px] "
								placeholder={`Message @${message?.clan_nick || message?.display_name || userById?.clan_nick || userById?.user?.display_name || userById?.user?.username}`}
								value={content}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										sendMessage(message?.sender_id || userById?.user?.id || '');
									}
								}}
								onChange={handleContent}
							/>
						</div>
					) : null}
					{showNote && (
						<>
							<div className="w-full border-b-[1px] dark:border-[#40444b] border-gray-200 p-2"></div>
							<NoteUserProfile />
						</>
					)}
					{!isFooterProfile && checkUser && (
						<button className="rounded dark:bg-slate-800 bg-bgLightModeButton py-2 hover:bg-opacity-50 mt-2" onClick={openSetting}>
							Edit Profile
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ModalUserProfile;
