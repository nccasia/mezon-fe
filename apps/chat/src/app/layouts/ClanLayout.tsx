import { ChannelList, ChannelTopbar, FooterProfile, ClanHeader, UserVoiceDashboard } from '@mezon/components';
import { MezonPolicyProvider, useAuth, useClans } from '@mezon/core';
import { useState } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { ClanLoaderData } from '../loaders/clanLoader';
import Setting from '../pages/setting';

const ClanLayout = () => {
	const { clanId } = useLoaderData() as ClanLoaderData;
	const { currentClan } = useClans();
	const { userProfile } = useAuth();
	const [openSetting, setOpenSetting] = useState(false);
	const handleOpenCreate = () => {
		setOpenSetting(true);
	};

	return (
		<div className="flex-row bg-bgSurface flex grow">
			<MezonPolicyProvider clanId={clanId}>
				<div className="flex flex-col w-widthSideBar max-w-[272px] bg-bgSurface relative">
					<ClanHeader name={currentClan?.clan_name} type="CHANNEL" bannerImage={currentClan?.banner} />
					<ChannelList />
					<UserVoiceDashboard />

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

export default ClanLayout;
