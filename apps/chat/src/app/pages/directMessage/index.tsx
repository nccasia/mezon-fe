import { ClanHeader, DirectMessageList, FooterProfile } from '@mezon/components';
import { useAuth } from '@mezon/core';
import { selectCloseMenu, selectStatusMenu } from '@mezon/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Setting from '../setting';
import { MainContentDirect } from './MainContentDirect';

export default function Direct() {
	const { userProfile } = useAuth();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);

	useEffect(() => {
		const recentEmojis = localStorage.getItem('recentEmojis');
		if (!recentEmojis) {
			localStorage.setItem('recentEmojis', JSON.stringify([]));
		}
	}, []);

	return (
		<>
			<div
				className={`flex-col  flex w-[272px] dark:bg-bgSecondary bg-bgLightMode relative min-w-widthMenuMobile sbm:min-w-[272px] ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}
			>
				<ClanHeader type={'direct'} />
				<DirectMessageList />
				<FooterProfile
					name={userProfile?.user?.display_name || userProfile?.user?.username || ''}
					status={userProfile?.user?.online}
					avatar={userProfile?.user?.avatar_url || ''}
					userId={userProfile?.user?.id}
					isDM={true}
				/>
			</div>
			<MainContentDirect />
			<Setting isDM={true} />
		</>
	);
}
