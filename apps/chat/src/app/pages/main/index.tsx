import {
	FirstJoinPopup,
	ForwardMessageModal,
	ModalCreateClan,
	NavLinkComponent,
	SearchModal,
	SidebarClanItem,
	SidebarTooltip,
} from '@mezon/components';
import { useAuth, useFriends, useMenu, useMessageValue, useReference } from '@mezon/core';
import {
	channelsActions,
	getIsShowPopupForward,
	selectAllClans,
	selectCloseMenu,
	selectCurrentClanId,
	selectDirectsUnreadlist,
	selectDmGroupCurrentId,
	selectDmGroupCurrentType,
	selectStatusMenu,
	selectTheme,
	useAppDispatch,
	usersClanActions,
} from '@mezon/store';
import { Image } from '@mezon/ui';
import { IClan, ModeResponsive, TIME_OF_SHOWING_FIRST_POPUP } from '@mezon/utils';
import { useCallback, useEffect, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { MainContent } from './MainContent';
import DirectUnreads from './directUnreads';

function MyApp() {
	const elementHTML = document.documentElement;
	const clans = useSelector(selectAllClans);
	const currentClanId = useSelector(selectCurrentClanId);
	const { userId } = useAuth();
	const pathName = useLocation().pathname;
	const [openCreateClanModal, closeCreateClanModal] = useModal(() => <ModalCreateClan open={true} onClose={closeCreateClanModal} />);
	const [openSearchModal, closeSearchModal] = useModal(() => <SearchModal onClose={closeSearchModal} open={true} />);
	const listUnreadDM = useSelector(selectDirectsUnreadlist);
	const { quantityPendingRequest } = useFriends();

	const { setCloseMenu, setStatusMenu } = useMenu();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);

	const { userProfile } = useAuth();
	const calculateJoinedTime = new Date().getTime() - new Date(userProfile?.user?.create_time ?? '').getTime();
	const isNewGuy = calculateJoinedTime <= TIME_OF_SHOWING_FIRST_POPUP;
	const [isShowFirstJoinPopup, setIsShowFirstJoinPopup] = useState(isNewGuy);

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

	const dispatchApp = useAppDispatch();
	useEffect(() => {
		if (currentClanId) {
			dispatchApp(channelsActions.fetchChannels({ clanId: currentClanId }));
			dispatchApp(usersClanActions.fetchUsersClan({ clanId: currentClanId }));
		}
	}, []);

	return (
		<div className="flex h-screen overflow-hidden text-gray-100 relative dark:bg-bgPrimary bg-bgLightModeSecond" onClick={handleClick}>
			{openPopupForward && <ForwardMessageModal openModal={openPopupForward} />}
			<div
				className={`w-[72px] overflow-y-auto py-4 px-3 dark:bg-bgTertiary bg-bgLightTertiary duration-100 hide-scrollbar flex flex-col items-center ${closeMenu ? (statusMenu ? '' : 'hidden') : ''}`}
				onClick={handleMenu}
				id="menu"
			>
				<div className="flex flex-col gap-3 ">
					<SidebarTooltip titleTooltip="Direct Message">
						<NavLink
							to={currentDmId ? `/chat/direct/message/${currentDmId}/${currentDmIType}` : '/chat/direct/friends'}
							onClick={() => setModeResponsive(ModeResponsive.MODE_DM)}
						>
							<NavLinkComponent active={pathName.includes('direct')}>
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
					</SidebarTooltip>
					{listUnreadDM.map(
						(dmGroupChatUnread) =>
							dmGroupChatUnread?.last_sent_message?.sender_id !== userId && (
								<SidebarTooltip key={dmGroupChatUnread.id} titleTooltip={dmGroupChatUnread.channel_label}>
									<DirectUnreads key={dmGroupChatUnread.id} directMessage={dmGroupChatUnread} />
								</SidebarTooltip>
							),
					)}
				</div>
				<div className="border-t-2 my-2 dark:border-t-borderDividerLight border-t-buttonLightTertiary duration-100 w-2/3"></div>
				<div className="flex flex-col gap-3 ">
					{clans.map((clan: IClan) => {
						return (
							<SidebarTooltip key={clan.clan_id} titleTooltip={clan.clan_name}>
								<SidebarClanItem linkClan={`/chat/clans/${clan.id}`} option={clan} active={!pathName.includes('direct') && currentClanId === clan.clan_id} />
							</SidebarTooltip>
						);
					})}
				</div>

				<SidebarTooltip titleTooltip="Add Clan">
					<NavLinkComponent>
						<div
							className="w-full h-full flex items-center justify-between text-contentSecondary rounded-md cursor-pointer hover:bg-bgLightModeButton group"
							onClick={openCreateClanModal}
						>
							<div className="dark:bg-bgPrimary bg-[#E1E1E1] flex justify-center items-center rounded-full cursor-pointer dark:group-hover:bg-slate-800 group-hover:bg-bgLightModeButton  transition-all duration-200 size-12">
								<p className="text-2xl font-bold text-[#155EEF]">+</p>
							</div>
						</div>
					</NavLinkComponent>
				</SidebarTooltip>
			</div>
			<MainContent />
			{isShowFirstJoinPopup && <FirstJoinPopup openCreateClanModal={openCreateClanModal} onclose={() => setIsShowFirstJoinPopup(false)} />}
		</div>
	);
}

export default MyApp;
