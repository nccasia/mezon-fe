import { ForwardMessageModal, ModalCreateClan, NavLinkComponent, SearchModal, SidebarClanItem } from '@mezon/components';
import { useAuth, useFriends, useMenu, useMessageValue, useReference } from '@mezon/core';
import {
	channelsActions,
	getIsShowPopupForward,
	selectAllClans,
	selectCloseMenu,
	selectCurrentChannel,
	selectCurrentClan,
	selectDirectsUnreadlist,
	selectDmGroupCurrentId,
	selectDmGroupCurrentType,
	selectStatusMenu,
	selectTheme,
	useAppDispatch,
	usersClanActions
} from '@mezon/store';
import { Image } from '@mezon/ui';
import { IClan, ModeResponsive } from '@mezon/utils';
import { useCallback, useEffect, useMemo } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { MainContent } from './MainContent';
import DirectUnreads from './directUnreads';

function MyApp() {
	const elementHTML = document.documentElement;
	const clans = useSelector(selectAllClans);
	const currentClan = useSelector(selectCurrentClan);
	const { userId } = useAuth();
	const pathName = useLocation().pathname;
	const [openCreateClanModal, closeCreateClanModal] = useModal(() => <ModalCreateClan open={true} onClose={closeCreateClanModal} />);
	const [openSearchModal, closeSearchModal] = useModal(() => <SearchModal onClose={closeSearchModal} open={true} />);
	const listUnreadDM = useSelector(selectDirectsUnreadlist);
	const currentChannel = useSelector(selectCurrentChannel);
	const { quantityPendingRequest } = useFriends();

	const { setCloseMenu, setStatusMenu } = useMenu();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	useEffect(() => {
		const handleSizeWidth = () => {
			if (window.innerWidth < 480) {
				setCloseMenu(true);
			} else {
				setCloseMenu(false);
			}
		};

		handleSizeWidth();

		if (closeMenu) {
			setStatusMenu(false);
		}

		const handleResize = () => {
			handleSizeWidth();
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	const handleMenu = (event: any) => {
		const elementClick = event.target;
		const wrapElement = document.querySelector('#menu');
		if (!closeMenu) {
			return;
		}
		if (elementClick.classList.contains('clan')) {
			if (elementClick.classList.contains('choose')) {
				setStatusMenu(false);
				elementClick.classList.remove('choose');
			} else {
				setStatusMenu(true);
				const elementOld = wrapElement?.querySelector('.choose');
				if (elementOld) {
					elementOld.classList.remove('choose');
				}
				elementClick.classList.add('choose');
			}
		}
	};

	const handleKeyDown = useCallback(
		(event: any) => {
			if (event.ctrlKey && event.key === 'k') {
				event.preventDefault();
				openSearchModal();
			}
		},
		[openSearchModal],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	const openPopupForward = useSelector(getIsShowPopupForward);

	const appearanceTheme = useSelector(selectTheme);
	useEffect(() => {
		switch (appearanceTheme) {
			case 'dark':
				elementHTML.classList.add('dark');
				break;
			case 'light':
				elementHTML.classList.remove('dark');
				break;
			default:
				break;
		}
	}, [appearanceTheme]);

	const { setModeResponsive } = useMessageValue();
	const { setOpenOptionMessageState } = useReference();

	const handleClick = useCallback(() => {
		setOpenOptionMessageState(false);
	}, []);

	const currentDmId = useSelector(selectDmGroupCurrentId);
	const currentDmIType = useSelector(selectDmGroupCurrentType);

	const initClan = useMemo(() => {
		if (currentChannel?.id && currentClan?.id) {
			localStorage.setItem('initClan', currentClan?.id);
			return `/chat/clans/${currentClan?.id}/channels/${currentChannel?.id}`;
		} else if (currentClan?.id) {
			localStorage.setItem('initClan', currentClan?.id);
			return `/chat/clans/${currentClan?.id}`;
		} else if (clans?.length > 0) {
			localStorage.setItem('initClan', clans[0].id);
			return `/chat/clans/${clans[0].id}`;
		}
		return ``;
	}, [clans, currentChannel?.id, currentClan?.id]);

	const dispatchApp = useAppDispatch();
	useEffect(() => {
		const initClanId = localStorage.getItem('initClan');
		if (initClanId) {
			dispatchApp(channelsActions.fetchChannels({ clanId: initClanId }));
			dispatchApp(usersClanActions.fetchUsersClan({ clanId: initClanId }));
		}
	}, []);

	return (
		<div className="flex h-screen text-gray-100 overflow-hidden relative dark:bg-bgPrimary bg-bgLightModeSecond" onClick={handleClick}>
			{openPopupForward && <ForwardMessageModal openModal={openPopupForward} />}
			<div
				className={`w-[72px] overflow-visible py-4 px-3 space-y-2 dark:bg-bgTertiary bg-bgLightTertiary duration-100 scrollbar-hide  ${closeMenu ? (statusMenu ? '' : 'hidden') : ''}`}
				onClick={handleMenu}
				id="menu"
			>
				<NavLink
					to={currentDmId ? `/chat/direct/message/${currentDmId}/${currentDmIType}` : '/chat/direct/friends'}
					onClick={() => setModeResponsive(ModeResponsive.MODE_DM)}
				>
					<NavLinkComponent active={pathName.includes('direct')} clanName="Direct Messages">
						<div>
							<Image
								src={`assets/images/${appearanceTheme === 'dark' ? 'mezon-logo-black.svg' : 'mezon-logo-white.svg'}`}
								alt={'logoMezon'}
								width={48}
								height={48}
								className="clan w-full aspect-square object-cover"
							/>
							{quantityPendingRequest !== 0 && (
								<div className="absolute border-[4px] dark:border-bgPrimary border-[#ffffff] w-[24px] h-[24px] rounded-full bg-colorDanger text-[#fff] font-bold text-[11px] flex items-center justify-center top-7 right-[-6px]">
									{quantityPendingRequest}
								</div>
							)}
						</div>
					</NavLinkComponent>
				</NavLink>
				{listUnreadDM.map(
					(dmGroupChatUnread) =>
						dmGroupChatUnread?.last_sent_message?.sender_id !== userId && (
							<DirectUnreads key={dmGroupChatUnread.id} directMessage={dmGroupChatUnread} />
						),
				)}
				<div className="py-1 border-t-2 dark:border-t-borderDividerLight border-t-buttonLightTertiary duration-100 w-2/3 mx-auto my-2"></div>
				<div className="relative flex flex-col gap-3">
					{clans.map((clan: IClan) => {
						return (
							<SidebarClanItem key={clan.clan_id} linkClan={`/chat/clans/${clan.id}`} option={clan} />
						)
					})}

				</div>
				<NavLinkComponent clanName={"Add Clan"}>
					<div className="w-full h-full flex items-center justify-between text-contentSecondary rounded-md cursor-pointer hover:bg-bgLightModeButton group">
						<button className="flex items-center" onClick={openCreateClanModal}>
							<div className="dark:bg-bgPrimary bg-[#E1E1E1] flex justify-center items-center rounded-full cursor-pointer dark:group-hover:bg-slate-800 group-hover:bg-bgLightModeButton  transition-all duration-200 size-12">
								<p className="text-2xl font-bold text-[#155EEF]">+</p>
							</div>
						</button>
					</div>
				</NavLinkComponent>
			</div>
			<MainContent />
		</div>
	);
}

export default MyApp;
