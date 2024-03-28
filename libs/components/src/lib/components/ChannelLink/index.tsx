import { useAppNavigation, useAuth, useClans } from '@mezon/core';
import { ChannelType } from '@mezon/mezon-js';
import { ChannelStatusEnum, IChannel } from '@mezon/utils';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SettingChannel from '../ChannelSetting';
import * as Icons from '../Icons';
import { AddPerson, SettingProfile } from '../Icons';
import UserListVoiceChannel from '../UserListVoiceChannel';
export type ChannelLinkProps = {
	clanId?: string;
	channel: IChannel;
	active?: boolean;
	createInviteLink: (clanId: string, channelId: string) => void;
	isPrivate?: number;
	isUnReadChannel?: boolean;
	numberNotication?: number;
	voiceChannelData: any;
};

function ChannelLink({
	clanId,
	channel,
	active,
	isPrivate,
	createInviteLink,
	isUnReadChannel,
	numberNotication,
	voiceChannelData,
}: ChannelLinkProps) {
	const state = active ? 'active' : channel?.unread ? 'inactiveUnread' : 'inactiveRead';
	// const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const { userProfile } = useAuth();
	const { currentClan } = useClans();

	const [openSetting, setOpenSetting] = useState(false);
	const handleOpenCreate = () => {
		setOpenSetting(true);
	};

	const classes = {
		active: 'flex flex-row items-center px-2 mx-2 rounded relative p-1',
		inactiveUnread: 'flex flex-row items-center px-2 mx-2 rounded relative p-1 hover:bg-[#36373D]',
		inactiveRead: 'flex flex-row items-center px-2 mx-2 rounded relative p-1 hover:bg-[#36373D]',
	};

	const { toChannelPage } = useAppNavigation();

	const handleCreateLinkInvite = () => {
		createInviteLink(clanId || '', channel.channel_id || '');
	};

	const channelPath = toChannelPage(channel.id, channel?.clan_id || '');

	return (
		<>
			<div className="relative group">
				<Link to={channelPath}>
					<span className={`${classes[state]} ${active ? 'bg-[#36373D]' : ''}`}>
						{state === 'inactiveUnread' && <div className="absolute left-0 -ml-2 w-1 h-2 bg-white rounded-r-full"></div>}
						<div className="relative mt-[-5px]">
							{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
								<Icons.SpeakerLocked defaultSize="w-5 h-5" />
							)}
							{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_TEXT && (
								<Icons.HashtagLocked defaultSize="w-5 h-5 " />
							)}
							{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-5 5-5" />}
							{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-5 h-5" />}
						</div>
						<p
							className={`ml-2 text-[#AEAEAE] w-full group-hover:text-white text-[15px] focus:bg-[#36373D] ${active ? 'text-white font-bold' : ''} ${isUnReadChannel ? '' : 'font-bold text-white'}`}
							title={channel.channel_label && channel?.channel_label.length > 20 ? channel?.channel_label : undefined}
						>
							{channel.channel_label && channel?.channel_label.length > 20
								? `${channel?.channel_label.substring(0, 20)}...`
								: channel?.channel_label}
						</p>
					</span>
				</Link>
				{channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
					<UserListVoiceChannel voiceChannelData={voiceChannelData} channelID={channel.id} />
				)}

				<AddPerson
					className={`absolute ml-auto w-4 h-4  top-[6px] group-hover:block group-hover:text-white  ${active ? 'text-white' : 'text-[#0B0B0B]'} ${currentClan?.creator_id === userProfile?.user?.id ? 'block right-8' : 'hidden right-3'} cursor-pointer`}
					onClick={handleCreateLinkInvite}
				/>
				<SettingProfile
					className={`absolute ml-auto w-4 h-4  top-[6px] right-3 ${active ? 'text-white' : 'text-[#0B0B0B]'} ${currentClan?.creator_id === userProfile?.user?.id ? 'block group-hover:block group-hover:text-white' : 'hidden'} cursor-pointer`}
					onClick={handleOpenCreate}
				/>
				<SettingChannel
					open={openSetting}
					onClose={() => {
						setOpenSetting(false);
					}}
					channel={channel}
				/>
			</div>
		</>
	);
}

export default ChannelLink;
