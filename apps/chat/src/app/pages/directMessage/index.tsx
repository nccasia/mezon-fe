import { ClanHeader, DirectMessageList, FooterProfile } from '@mezon/components';
import { useAuth, useEscapeKey } from '@mezon/core';
import { AppDispatch, channelsActions, selectCloseMenu, selectStatusMenu } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Setting from '../setting';
import { MainContentDirect } from './MainContentDirect';

export default function Direct() {
	const dispatch = useDispatch<AppDispatch>();
	const { userProfile } = useAuth();
	const [openSetting, setOpenSetting] = useState(false);
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const initClan = localStorage.getItem('initClan');

	useEscapeKey(() => setOpenSetting(false));

	useEffect(() => {
		if(initClan) dispatch(channelsActions.fetchChannels({clanId: initClan}));
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
