import { ChannelList, ChannelTopbar, ClanHeader, FooterProfile } from '@mezon/components';
import { MezonPolicyProvider, useAuth, useClans, useMenu, useThreads } from '@mezon/core';
import { selectCurrentChannel, selectCurrentVoiceChannel } from '@mezon/store';
import { ChannelType } from 'mezon-js';
import { useState } from 'react';
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

	const [openSetting, setOpenSetting] = useState(false);

	const currentChannel = useSelector(selectCurrentChannel);
	const currentVoiceChannel = useSelector(selectCurrentVoiceChannel);
	const handleOpenCreate = () => {
		setOpenSetting(true);
	};

	return (
		<div className="flex flex-row flex-1 bg-bgSurface">
			<MezonPolicyProvider clanId={clanId}>
				<div className={` flex-col max-w-[272px] bg-bgSurface relative overflow-hidden ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}>
					<ClanHeader name={currentClan?.clan_name} type="CHANNEL" bannerImage={currentClan?.banner} />
					<ChannelList channelCurrentType={currentVoiceChannel?.type} />
					<FooterProfile
						name={userProfile?.user?.username || ''}
						status={userProfile?.user?.online}
						avatar={userProfile?.user?.avatar_url || ''}
						openSetting={handleOpenCreate}
						channelCurrent={currentChannel}
					/>
				</div>
				<div
					className={`flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-visible ${currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? 'group' : ''}`}
				>
					<ChannelTopbar channel={currentChannel} />
					<div className="flex flex-row">
						<Outlet />
					</div>
				</div>
				{isShowCreateThread && (
					<>
						<div className="w-2 cursor-ew-resize bg-[#000]" />
						<div className="w-[480px] bg-[#1E1E1E] rounded-l-lg">
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
