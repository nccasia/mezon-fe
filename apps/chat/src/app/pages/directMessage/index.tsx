import { ClanHeader, DirectMessageList, FooterProfile } from '@mezon/components';
import { useAuth, useEscapeKey } from '@mezon/core';
import { selectCloseMenu, selectStatusMenu } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Setting from '../setting';
import { MainContentDirect } from './MainContentDirect';

export default function Direct() {
	const { userProfile } = useAuth();
	const [openSetting, setOpenSetting] = useState(false);
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);

	useEscapeKey(() => setOpenSetting(false));

	useEffect(() => {
		localStorage.setItem('recentEmojis', JSON.stringify([]));
	}, []);

	return (
		<>
			<div
				className={`flex-col  flex w-[272px] dark:bg-bgSecondary bg-[#F7F7F7] relative min-w-widthMenuMobile sbm:min-w-[272px] ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}
			>
				<ClanHeader type={'direct'} />
				<DirectMessageList />
				<FooterProfile
					name={userProfile?.user?.display_name || userProfile?.user?.username || ''}
					status={userProfile?.user?.online}
					avatar={userProfile?.user?.avatar_url || ''}
					userId={userProfile?.user?.id}
				/>
			</div>
			<MainContentDirect />
			<Setting />
		</>
	);
}
