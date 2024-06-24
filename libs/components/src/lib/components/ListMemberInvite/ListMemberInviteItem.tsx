import { useDirect, useSendInviteMessage } from '@mezon/core';
import { DirectEntity, UsersClanEntity } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { useEffect, useState } from 'react';
import { ChannelType } from 'mezon-js';

type ItemPorp = {
	url: string;
	dmGroup?: DirectEntity;
	user?: UsersClanEntity;
	isSent?: boolean;
	onSend: (dmGroup: DirectEntity) => void;
};
const ListMemberInviteItem = (props: ItemPorp) => {
	const { dmGroup, isSent, url, onSend, user } = props;
	const { createDirectMessageWithUser } = useDirect();
	const [isInviteSent, setIsInviteSent] = useState(isSent);
	const mezon = useMezon();
	const { sendInviteMessage } = useSendInviteMessage();
	const directMessageWithUser = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response.channel_id) {
			sendInviteMessage(url, response.channel_id);
		}
	};

	const handleButtonClick = async (directParamId?: string, type?: number, userId?: string) => {
		setIsInviteSent(true);
		if (userId) {
			directMessageWithUser(userId);
		}
		if (directParamId && dmGroup) {
			sendInviteMessage(url, directParamId);
			onSend(dmGroup);
		}
	};
	useEffect(() => {
		setIsInviteSent(isSent);
	}, [isSent]);
	return (
		dmGroup ? (
				<div key={dmGroup.channel_id} className="flex items-center justify-between h-14">
					{Array.isArray(dmGroup.channel_avatar) && dmGroup.channel_avatar.length > 1 ? (
						<img src={`/assets/images/avatar-group.png`} alt="" className="size-10 min-w-10 min-h-10 object-cover rounded-full" />
					) : (
						<img src={dmGroup.channel_avatar?.at(0)} alt="" className="size-10 min-w-10 min-h-10 object-cover rounded-full" />
					)}
					<p style={{ marginRight: 'auto' }} className="pl-[10px] max-w-full overflow-hidden text truncate">
						{dmGroup.channel_label}
					</p>
					<button
						onClick={() => handleButtonClick(dmGroup.channel_id || '', dmGroup.type || 0)}
						disabled={isInviteSent}
						className={
							isInviteSent
								? 'bg-gray-400 text-gray-700 cursor-not-allowed border border-solid border-gray-400 rounded-[5px] py-[5px] px-[10px]'
								: 'font-sans font-normal text-[16px] bg-blue-200 hover:text-blue-300 text-blue-700 border border-solid border-green-500 rounded-[5px] py-[5px] px-[29px]'
						}
					>
						{isInviteSent ? 'Sent' : 'Invite'}
					</button>
				</div>
			) : (
				<div key={user?.id} className="flex items-center justify-between h-14">
					{!user?.user?.avatar_url ? (
						<div className="w-[38px] h-[38px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[16px]">
							{user?.user?.display_name?.charAt(0).toUpperCase()}
						</div>
					) : (
						<img src={user?.user?.avatar_url} alt="" className="w-[40px] h-[40px] rounded-full" />
					)}
					<p style={{ marginRight: 'auto' }} className="pl-[10px]">
						{user?.user?.display_name}
					</p>
					<button
						onClick={() => handleButtonClick('', 0, user?.id)}
						disabled={isInviteSent}
						className={
							isInviteSent
								? 'bg-gray-400 text-gray-700 cursor-not-allowed border border-solid border-gray-400 rounded-[5px] py-[5px] px-[10px]'
								: 'font-sans font-normal text-[16px] bg-blue-200 hover:text-blue-300 text-blue-700 border border-solid border-green-500 rounded-[5px] py-[5px] px-[29px]'
						}
					>
						{isInviteSent ? 'Sent' : 'Invite'}
					</button>
				</div>
			)
	);
};
export default ListMemberInviteItem;
