import { ChannelList, ChannelTopbar, FooterProfile, ServerHeader } from '@mezon/components';
import { MezonPolicyProvider, useAuth, useClans } from '@mezon/core';
import { useState } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { ServerLoaderData } from '../loaders/serverLoader';
import Setting from '../pages/setting';

const ServerLayout = () => {
	const { serverId } = useLoaderData() as ServerLoaderData;
	const { currentClan } = useClans();
	const { userProfile } = useAuth();
	const [openSetting, setOpenSetting] = useState(false);
	const handleOpenCreate = () => {
		setOpenSetting(true);
	};

	return (
		<div className="flex-row bg-bgSurface flex grow">
			<MezonPolicyProvider clanId={serverId}>
				<div className="flex flex-col w-[272px] bg-bgSurface relative">
					<ServerHeader name={currentClan?.clan_name} type="channel" bannerImage={currentClan?.banner} />
					<ChannelList />
					<FooterProfile
						name={userProfile?.user?.username || ''}
						status={userProfile?.user?.online}
						avatar={userProfile?.user?.avatar_url || ''}
						openSetting={handleOpenCreate}
					/>
				</div>
				<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-hidden">
					<ChannelTopbar channel={undefined} />
					<div className="flex h-heightWithoutTopBar flex-row">
						<Outlet />
					</div>
				</div>
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

export default ServerLayout;
