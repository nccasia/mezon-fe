import { useAuth, useDirect, useSendInviteMessage } from '@mezon/core';
import { selectMemberByUserId } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { ChannelType } from 'mezon-js';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getColorAverageFromURL } from '../SettingProfile/AverageColor';
import AboutUserProfile from './AboutUserProfile';
import AvatarProfile from './AvatarProfile';
import RoleUserProfile from './RoleUserProfile';
import StatusProfile from './StatusProfile';
type ModalUserProfileProps = {
	userID?: string;
	isFooterProfile?: boolean;
};

const ModalUserProfile = ({ userID, isFooterProfile }: ModalUserProfileProps) => {
	const userById = useSelector(selectMemberByUserId(userID ?? ''));

	const { sendInviteMessage } = useSendInviteMessage();
	const { createDirectMessageWithUser } = useDirect();
	const [content, setContent] = useState<string>('');
	const { userProfile } = useAuth();
	const mezon = useMezon();

	const sendMessage = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response.channel_id) {
			mezon.joinChatDirectMessage(response.channel_id, '', ChannelType.CHANNEL_TYPE_DM);
			sendInviteMessage(content, response.channel_id);
			setContent('');
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
	const [color, setColor] = useState<string>('#323232');

	const getColor = async () => {
		if (checkUrl(userProfile?.user?.avatar_url) && checkUrl(userById?.user?.avatar_url)) {
			const url = isFooterProfile ? userProfile?.user?.avatar_url : userById?.user?.avatar_url;
			const colorImg = await getColorAverageFromURL(url || '');
			if (colorImg) setColor(colorImg);
		}
	};

	useEffect(() => {
		getColor();
	}, []);

	return (
		<div>
			<div className="h-[60px] rounded-tl-lg rounded-tr-lg" style={{ backgroundColor: color }}></div>
			<AvatarProfile
				avatar={isFooterProfile ? userProfile?.user?.avatar_url : userById?.user?.avatar_url}
				username={isFooterProfile ? userProfile?.user?.username : userById?.user?.username}
			/>
			<div className="px-[16px]">
				<div className="dark:bg-bgProfileBody bg-white w-full p-2 my-[16px] dark:text-white text-black rounded-[10px] flex flex-col gap-3 text-justify">
					<div>
						<p className="font-semibold tracking-wider text-xl one-line my-0">{userById?.user?.username}</p>
						<p className="font-medium tracking-wide text-sm my-0">{userById?.user?.display_name}</p>
					</div>
					<div className="w-full border-b-[1px] dark:border-[#40444b] border-gray-200 opacity-70 text-center"></div>
					{isFooterProfile ? null : <AboutUserProfile userID={userID} />}
					{isFooterProfile ? <StatusProfile userById={userById} /> : <RoleUserProfile userID={userID} />}

					{!checkOwner(userById?.user?.google_id || '') ? (
						<div className="w-full items-center">
							<input
								type="text"
								className="w-full border dark:border-bgDisable rounded-[5px] dark:bg-bgDisable bg-bgLightModeSecond p-[5px] "
								placeholder={`Message @${userById?.user?.username}`}
								value={content}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										sendMessage(userById?.user?.id || '');
									}
								}}
								onChange={handleContent}
							/>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default ModalUserProfile;
