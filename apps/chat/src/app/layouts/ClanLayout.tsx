import { ChannelList, ChannelTopbar, ClanHeader, EmojiPickerComp, FooterProfile } from '@mezon/components';
import { MezonPolicyProvider, useApp, useAuth, useClans, useMenu, useReference, useThreads } from '@mezon/core';
import { selectCurrentChannel, selectCurrentVoiceChannel, selectReactionRightState, selectReactionTopState, useAppDispatch } from '@mezon/store';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLoaderData } from 'react-router-dom';
import { ClanLoaderData } from '../loaders/clanLoader';
import Setting from '../pages/setting';
import ThreadsMain from '../pages/thread';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';

const ClanLayout = () => {
	const reactionRightState = useSelector(selectReactionRightState);
	const { clanId } = useLoaderData() as ClanLoaderData;
	const { currentClan } = useClans();
	const { userProfile } = useAuth();
	const { closeMenu, statusMenu } = useMenu();

	const { isShowCreateThread } = useThreads();
	const { isShowMemberList, setIsShowMemberList } = useApp();
	const { referenceMessage } = useReference();
	const reactionTopState = useSelector(selectReactionTopState);

	const [openSetting, setOpenSetting] = useState(false);

	const currentChannel = useSelector(selectCurrentChannel);
	const currentVoiceChannel = useSelector(selectCurrentVoiceChannel);
	const handleOpenCreate = () => {
		setOpenSetting(true);
	};

	useEffect(()=>{
		if(isShowCreateThread){
			setIsShowMemberList(false);
		}
	},[isShowCreateThread])

	return (
		<div className="flex flex-row flex-1 bg-bgSurface">
			<MezonPolicyProvider clanId={clanId}>
				<div
					className={` flex-col flex max-w-[272px] bg-bgSecondary relative overflow-hidden ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}
				>
					<ClanHeader name={currentClan?.clan_name} type="CHANNEL" bannerImage={currentClan?.banner} />
					<ChannelList channelCurrentType={currentVoiceChannel?.type} />
					<FooterProfile
						name={userProfile?.user?.username || ''}
						status={userProfile?.user?.online}
						avatar={userProfile?.user?.avatar_url || ''}
						userId={userProfile?.user?.id || ''}
						openSetting={handleOpenCreate}
						channelCurrent={currentChannel}
					/>
				</div>
				<div
					className={`flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-visible ${currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? 'group' : ''}`}
				>
					<ChannelTopbar channel={currentChannel} />
					<div className="flex h-heightWithoutTopBar flex-row">
						<Outlet />
					</div>
					{ reactionRightState &&  
						<div id="emojiPicker" className={`fixed size-[500px] right-1 ${closeMenu && !statusMenu && 'w-[370px]'} ${reactionTopState ? 'top-20' : 'bottom-20'} ${isShowCreateThread && 'ssm:right-[650px]'} ${isShowMemberList && 'ssm:right-[420px]'} ${!isShowCreateThread && !isShowMemberList && 'ssm:right-44'}`}>
							<div className="mb-0 z-10 h-full">
								<EmojiPickerComp messageEmoji={referenceMessage as IMessageWithUser} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} emojiAction={EmojiPlaces.EMOJI_REACTION} />
							</div>
						</div>
					}
				</div>
				{isShowCreateThread && (
					<>
						<div className="w-2 cursor-ew-resize bg-bgTertiary" />
						<div className="w-[480px] bg-bgPrimary rounded-l-lg">
							<ThreadsMain />
						</div>
					</>
				)}
				<Setting
					open={openSetting}
					onClose={() => {
						setOpenSetting(false);
					}}
				/>
			</MezonPolicyProvider>
		</div>
	);
};

export default ClanLayout;
