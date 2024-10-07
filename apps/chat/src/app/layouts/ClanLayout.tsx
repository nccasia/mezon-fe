import { ChannelList, ChannelTopbar, ClanHeader, FooterProfile, StreamInfo } from '@mezon/components';
import { useApp, useAppNavigation, useAppParams, useThreads } from '@mezon/core';
import {
	selectAllAccount,
	selectCloseMenu,
	selectCurrentChannel,
	selectCurrentClan,
	selectIsShowChatStream,
	selectStatusMenu,
	selectStatusStream
} from '@mezon/store';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLoaderData } from 'react-router-dom';
import { ClanLoaderData } from '../loaders/clanLoader';
import ChatStream from '../pages/chatStream';
import Setting from '../pages/setting';
import ThreadsMain from '../pages/thread';

const ClanLayout = () => {
	const { clanId } = useLoaderData() as ClanLoaderData;
	const currentClan = useSelector(selectCurrentClan);
	const userProfile = useSelector(selectAllAccount);
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const streamPlay = useSelector(selectStatusStream);
	const isShowChatStream = useSelector(selectIsShowChatStream);
	const { toMembersPage } = useAppNavigation();
	const { currentURL } = useAppParams();
	const memberPath = toMembersPage(currentClan?.clan_id || '');

	const { isShowCreateThread } = useThreads();
	const { setIsShowMemberList } = useApp();

	const currentChannel = useSelector(selectCurrentChannel);

	useEffect(() => {
		if (isShowCreateThread) {
			setIsShowMemberList(false);
		}
	}, [isShowCreateThread]);

	return (
		<>
			<div
				className={`select-none flex-col flex max-w-[272px] dark:bg-bgSecondary bg-bgLightSecondary relative overflow-hidden min-w-widthMenuMobile sbm:min-w-[272px] ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}
			>
				<ClanHeader name={currentClan?.clan_name} type="CHANNEL" bannerImage={currentClan?.banner} />
				<ChannelList />
				{streamPlay && <StreamInfo />}
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
				className={`flex gap-2 w-full ${currentChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING && memberPath !== currentURL ? 'dark:bg-bgTertiary bg-bgLightTertiary' : ''}`}
			>
				<div
					className={`flex flex-col flex-1 shrink min-w-0 bg-transparent h-[100%] overflow-visible ${currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? 'group' : ''}`}
				>
					<ChannelTopbar channel={currentChannel} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />
					{(currentChannel?.type !== ChannelType.CHANNEL_TYPE_STREAMING || memberPath === currentURL) && <Outlet />}
				</div>

				{isShowChatStream && currentChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING && memberPath !== currentURL && (
					<div className="w-[480px] dark:bg-bgPrimary bg-bgLightPrimary rounded-l-lg">
						<ChatStream currentChannel={currentChannel} />
					</div>
				)}
			</div>
			{isShowCreateThread && (
				<div className="w-[480px] dark:bg-bgPrimary bg-bgLightPrimary rounded-l-lg">
					<ThreadsMain />
				</div>
			)}
			<Setting isDM={false} />
		</>
	);
};

export default ClanLayout;
