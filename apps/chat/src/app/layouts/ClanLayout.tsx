import { ChannelList, ChannelTopbar, ClanHeader, FooterProfile } from '@mezon/components';
import { MezonPolicyProvider, useApp, useAuth, useClans, useMenu, useThreads } from '@mezon/core';
import { selectCurrentChannel, selectCurrentVoiceChannel } from '@mezon/store';
import { ChannelType } from 'mezon-js';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLoaderData } from 'react-router-dom';
import { ClanLoaderData } from '../loaders/clanLoader';
import Setting from '../pages/setting';
import ThreadsMain from '../pages/thread';

const ClanLayout = () => {
	const { clanId } = useLoaderData() as ClanLoaderData;
	const { currentClan } = useClans();
	const { userProfile } = useAuth();
	const { closeMenu, statusMenu } = useMenu();

	const { isShowCreateThread } = useThreads();
	const { setIsShowMemberList } = useApp();

	const [openSetting, setOpenSetting] = useState(false);

	const currentChannel = useSelector(selectCurrentChannel);
	const currentVoiceChannel = useSelector(selectCurrentVoiceChannel);
	const handleOpenCreate = () => {
		setOpenSetting(true);
	};

	useEffect(() => {
		if (isShowCreateThread) {
			setIsShowMemberList(false);
		}
	}, [isShowCreateThread]);

	return (
		<div className="flex flex-row flex-1 bg-transparent">
			<MezonPolicyProvider clanId={clanId}>
				<div
					className={` flex-col flex max-w-[272px] dark:bg-bgSecondary bg-bgLightSecondary relative overflow-hidden min-w-widthMenuMobile sbm:min-w-[272px] ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}
				>
					<ClanHeader name={currentClan?.clan_name} type="CHANNEL" bannerImage={currentClan?.banner} />
					<ChannelList channelCurrentType={currentVoiceChannel?.type} />
					<FooterProfile
						name={userProfile?.user?.display_name || ''}
						status={userProfile?.user?.online}
						avatar={userProfile?.user?.avatar_url || ''}
						userId={userProfile?.user?.id || ''}
						openSetting={handleOpenCreate}
						channelCurrent={currentChannel}
					/>
				</div>
				<div
					className={`flex flex-col flex-1 shrink min-w-0 bg-transparent h-[100%] overflow-visible ${currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? 'group' : ''}`}
				>
					<ChannelTopbar channel={currentChannel} />
					<Outlet />
				</div>
				{isShowCreateThread && (
					<>
						<div className="w-2 cursor-ew-resize dark:bg-bgTertiary bg-white" />
						<div className="w-[480px] dark:bg-bgPrimary bg-bgLightModeSecond rounded-l-lg">
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
