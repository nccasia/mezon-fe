import { ClanHeader, DirectMessageList, FooterProfile, UserVoiceDashboard } from '@mezon/components';
import { useAuth } from '@mezon/core';
import { useState } from 'react';
import Setting from '../setting';
import { MainContentDirect } from './MainContentDirect';

export default function Direct() {
	const { userProfile } = useAuth();
	const [openSetting, setOpenSetting] = useState(false);
	const handleOpenCreate = () => {
		setOpenSetting(true);
	};

	return (
		<>
			<div className=" flex-col w-[272px] bg-bgSurface relative">
				<ClanHeader type={'direct'} />
				<DirectMessageList />

				<FooterProfile
					name={userProfile?.user?.username || ''}
					status={userProfile?.user?.online}
					avatar={userProfile?.user?.avatar_url || ''}
					openSetting={handleOpenCreate}
				/>
			</div>
			<MainContentDirect />
			<Setting
				open={openSetting}
				onClose={() => {
					setOpenSetting(false);
				}}
			/>
		</>
	);
}
