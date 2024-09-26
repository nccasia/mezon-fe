import { ChannelList, ChannelTopbar, ClanHeader, FooterProfile } from '@mezon/components';
import { MezonPolicyProvider, useApp, useThreads } from '@mezon/core';
import {
	selectAllAccount,
	selectCloseMenu,
	selectCurrentChannel,
	selectCurrentClan,
	selectCurrentStreamInfo,
	selectStatusMenu,
	selectStreamChannelByChannelId,
	selectStreamMembersByChannelId
} from '@mezon/store';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLoaderData } from 'react-router-dom';
import { ClanLoaderData } from '../loaders/clanLoader';
import ChannelStream from '../pages/channel/ChannelStream';
import Setting from '../pages/setting';
import ThreadsMain from '../pages/thread';

const ClanLayout = () => {
	const { clanId } = useLoaderData() as ClanLoaderData;
	const currentClan = useSelector(selectCurrentClan);
	const userProfile = useSelector(selectAllAccount);
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const currentStreamInfo = useSelector(selectCurrentStreamInfo);
	const streamChannelMember = useSelector(selectStreamMembersByChannelId(currentStreamInfo?.streamId || ''));
	const channelStream = useSelector(selectStreamChannelByChannelId(currentStreamInfo?.streamId || ''));

	const { isShowCreateThread } = useThreads();
	const { setIsShowMemberList } = useApp();

	const currentChannel = useSelector(selectCurrentChannel);

	useEffect(() => {
		if (isShowCreateThread) {
			setIsShowMemberList(false);
		}
	}, [isShowCreateThread]);

	return (
		<MezonPolicyProvider clanId={clanId}>
			<div
				className={` flex-col flex max-w-[272px] dark:bg-bgSecondary bg-bgLightSecondary relative overflow-hidden min-w-widthMenuMobile sbm:min-w-[272px] ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}
			>
				<ClanHeader name={currentClan?.clan_name} type="CHANNEL" bannerImage={currentClan?.banner} />
				<ChannelList />
				{/* <StreamInfo /> */}
				<FooterProfile
					name={userProfile?.user?.display_name || userProfile?.user?.username || ''}
					status={userProfile?.user?.online}
					avatar={userProfile?.user?.avatar_url || ''}
					userId={userProfile?.user?.id || ''}
					channelCurrent={currentChannel}
					isDM={false}
				/>
			</div>
			<div
				className={`flex flex-col flex-1 shrink min-w-0 bg-transparent h-[100%] overflow-visible ${currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? 'group' : ''}`}
			>
				{/* {currentChannel?.type !== ChannelType.CHANNEL_TYPE_STREAMING && ( */}
				<ChannelTopbar channel={currentChannel} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />
				{/* )} */}
				<Outlet />
			</div>
			{isShowCreateThread && (
				<div className="w-[480px] dark:bg-bgPrimary bg-bgLightPrimary rounded-l-lg">
					<ThreadsMain />
				</div>
			)}
			<Setting isDM={false} />
			<div
				className={`fixed h-[calc(100vh_-_60px)] w-[calc(100vw_-_344px)] right-0 bottom-0 ${currentChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING ? ' flex justify-center items-center' : 'hidden pointer-events-none'}`}
			>
				<ChannelStream
					key={currentStreamInfo?.streamId}
					hlsUrl={channelStream?.streaming_url}
					memberJoin={streamChannelMember}
					channelName={currentChannel?.channel_label}
					currentStreamInfo={currentStreamInfo}
				/>
			</div>
		</MezonPolicyProvider>
	);
};

export default ClanLayout;
