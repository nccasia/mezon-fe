import { ChannelVoice, MemberList } from '@mezon/components';
import { ChatContext, useAuth, useClans } from '@mezon/core';
import { selectCurrentChannel, selectIsShowMemberList } from '@mezon/store';
import { useContext, useRef } from 'react';
import { useSelector } from 'react-redux';
import ChannelMessages from './ChannelMessages';
import { ChannelMessageBox } from './ChannelMessageBox';
import { ChannelTyping } from './ChannelTyping';
import { useMezon } from '@mezon/transport';
import { ChannelStreamMode, ChannelType } from '@mezon/mezon-js';

export default function ChannelLayout() {
	const isShow = useSelector(selectIsShowMemberList);
	const currentChannel = useSelector(selectCurrentChannel);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const { isOpenEmojiMessBox, setIsOpenEmojiMessBox } = useContext(ChatContext);
	const { currentClan } = useClans();
	const { userProfile } = useAuth();
	const { sessionRef } = useMezon();

	const renderChannelMedia = () => {
		if (currentChannel && currentChannel.type === ChannelType.CHANNEL_TYPE_TEXT) {
			return <ChannelMessages channelId={currentChannel?.id} channelLabel={currentChannel.channel_label} type="CHANNEL" mode={ChannelStreamMode.STREAM_MODE_CHANNEL}/>
		} else if (currentChannel && currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			return <ChannelVoice jwt={sessionRef.current?.token || ''} 
						channelId={currentChannel.channel_id || '' }
						channelLabel={currentChannel.channel_label || ''} 
						clanId={currentClan?.id || ""} 
						clanName={currentClan?.clan_name || ""} 
						userName={userProfile?.user?.username || "unknown"} 
					/>
		} else {
			return <ChannelMessages.Skeleton />
		}
	}

	return (
		<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-hidden" id="mainChat">
			<div className="flex h-heightWithoutTopBar flex-row ">
				<div  className="flex flex-col flex-1 w-full h-full">
					<div
						className="overflow-y-auto bg-[#1E1E1E] max-w-widthMessageViewChat overflow-x-hidden max-h-heightMessageViewChat h-heightMessageViewChat"
						ref={messagesContainerRef}
					>
						{renderChannelMedia()}						
					</div>
					<div className="flex-shrink-0 flex flex-col bg-[#1E1E1E] h-auto relative">
						{currentChannel && <ChannelTyping channelId={currentChannel?.id} channelLabel={currentChannel?.channel_label || ''} mode={2} />}
						{currentChannel ? (
							<ChannelMessageBox clanId={currentChannel?.clan_id} channelId={currentChannel?.id} channelLabel={currentChannel?.channel_label || ''} mode={2} />

						) : (
							<ChannelMessageBox.Skeleton />
						)}
					</div>
				</div>
				{isShow && (
					<div className="w-[245px] bg-bgSurface flex text-[#84ADFF] relative" id="memberList">
						<MemberList />
					</div>
				)}
			</div>
		</div>
	);
}
