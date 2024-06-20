import { ClanHeader, DirectMessageList, FooterProfile } from '@mezon/components';
import { useAuth, useEscapeKey, useMenu } from '@mezon/core';
import { useState } from 'react';
import Setting from '../setting';
import { MainContentDirect } from './MainContentDirect';

export default function Direct() {
	const { userProfile } = useAuth();
	const [openSetting, setOpenSetting] = useState(false);
	const { statusMenu, closeMenu } = useMenu();
	const handleOpenCreate = () => {
		setOpenSetting(true);
	};

	useEscapeKey(() => setOpenSetting(false));

	return (
		<>
			<div
				className={`flex-col  flex w-[272px] dark:bg-bgSecondary bg-[#F7F7F7] relative min-w-widthMenuMobile sbm:min-w-[272px] ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}
			>
				<ClanHeader type={'direct'} />
				<DirectMessageList />
				<FooterProfile
					name={userProfile?.user?.username || ''}
					status={userProfile?.user?.online}
					avatar={userProfile?.user?.avatar_url || ''}
					openSetting={handleOpenCreate}
					userId={userProfile?.user?.id}
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
