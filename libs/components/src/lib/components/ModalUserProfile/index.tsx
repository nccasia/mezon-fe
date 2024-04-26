import { useAuth, useDirect, useSendInviteMessage } from '@mezon/core';
import { selectMemberByUserId } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { ChannelType } from 'mezon-js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import AvatarProfile from './AvatarProfile';
import RoleUserProfile from './RoleUserProfile';
import StatusProfile from './StatusProfile';
type ModalUserProfileProps = {
	userID?: string;
	isFooterProfile?: boolean;
};

const ModalUserProfile = ({ userID, isFooterProfile }: ModalUserProfileProps) => {
	const userById = useSelector(selectMemberByUserId(userID || ''));

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

	return (
		<div>
			<div className="h-[60px] bg-[#8CBC4F] rounded-tr-[10px] rounded-tl-[10px]"></div>
			<AvatarProfile userById={userById} />
			<div className="px-[16px]">
				<div className="bg-[#232428] w-full p-3 my-[16px] rounded-[10px] flex flex-col gap-3 text-justify">
					<div>
						<p className="font-semibold tracking-wider text-xl one-line">{userById?.user?.username}</p>
						<p className="font-medium tracking-wide text-sm">{userById?.user?.display_name}</p>
					</div>
					<div className="w-full border-b-[1px] border-[#40444b] opacity-70 text-center"></div>
					{isFooterProfile ? <StatusProfile /> : <RoleUserProfile userID={userID} />}

					{!checkOwner(userById?.user?.google_id || '') ? (
						<div className="w-full items-center">
							<input
								type="text"
								className="w-full border border-bgDisable rounded-[5px] bg-bgDisable p-[5px] "
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
