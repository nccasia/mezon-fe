import { ModalCreateClan, ModalListClans, NavLinkComponent, SearchModal } from '@mezon/components';
import { useApp, useAppNavigation, useFriends, useMenu } from '@mezon/core';
import { selectAllClans, selectCurrentChannel, selectCurrentClan } from '@mezon/store';
import { Image } from '@mezon/ui';
import ForwardMessageModal from 'libs/components/src/lib/components/ForwardMessage';
import MessageModalImage from 'libs/components/src/lib/components/MessageWithUser/MessageModalImage';
import { getIsShowPopupForward, toggleIsShowPopupForwardFalse } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { useEffect, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { MainContent } from './MainContent';

function MyApp() {
	const clans = useSelector(selectAllClans);
	const currentClan = useSelector(selectCurrentClan);
	const [openListClans, setOpenListClans] = useState(false);
	const { navigate, toClanPage } = useAppNavigation();
	const pathName = useLocation().pathname;
	const [openCreateClanModal, closeCreateClanModal] = useModal(() => <ModalCreateClan open={true} onClose={closeCreateClanModal} />);
	const [openSearchModal, closeSearchModal] = useModal(() => <SearchModal onClose={closeSearchModal} open={true} />);

	const handleChangeClan = (clanId: string) => {
		navigate(toClanPage(clanId));
	};

	const { quantityPendingRequest } = useFriends();

	const dispatch = useDispatch();

	const { setCloseMenu, setStatusMenu, closeMenu, statusMenu } = useMenu();
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

	const currentChannel = useSelector(selectCurrentChannel);
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

	const handleKeyDown = (event: any) => {
		if (event.ctrlKey && event.key === 'k') {
			event.preventDefault();
			openSearchModal();
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	const openPopupForward = useSelector(getIsShowPopupForward);
	const handleCloseModalForward = () => {
		dispatch(toggleIsShowPopupForwardFalse());
	};

	const { appearanceTheme } = useApp();
	return (
		<div className="flex h-screen text-gray-100 overflow-hidden relative">
			{openPopupForward && <ForwardMessageModal openModal={openPopupForward} onClose={handleCloseModalForward} />}
			<div
				className={`w-[72px] overflow-visible py-4 px-3 space-y-2 dark:bg-bgTertiary bg-white duration-100 scrollbar-hide  ${closeMenu ? (statusMenu ? '' : 'hidden') : ''}`}
				onClick={handleMenu}
				id="menu"
			>
				<NavLink to="/chat/direct/friends">
					<NavLinkComponent active={pathName.includes('direct')} clanName="DM">
						<div>
							<Image src={`/assets/images/${appearanceTheme === "dark" ? "mezon-logo-black.svg" : "mezon-logo-white.svg"}`} alt={'logoMezon'} width={48} height={48} className="clan w-full aspect-square" />
							{quantityPendingRequest !== 0 && (
								<div className="absolute border-[4px] border-bgPrimary w-[24px] h-[24px] rounded-full bg-colorDanger text-[#fff] font-bold text-[11px] flex items-center justify-center top-7 right-[-6px]">
									{quantityPendingRequest}
								</div>
							)}
						</div>
					</NavLinkComponent>
				</NavLink>
				<div className="py-2 border-t-2 dark:border-t-borderDefault border-t-[#E1E1E1] duration-100" style={{ marginTop: '16px' }}></div>
				{currentClan?.id && (
					<NavLink
						to={`${currentChannel?.id ? `/chat/clans/${currentClan.id}/channels/${currentChannel?.id}` : `/chat/clans/${currentClan.id}`}`}
					>
						<NavLinkComponent active={!pathName.includes('direct')} clanName={currentClan?.clan_name || ''}>
							{currentClan?.logo ? (
								<Image
									src={currentClan?.logo || ''}
									alt={currentClan?.clan_name || ''}
									placeholder="blur"
									width={48}
									blurdataurl={currentClan?.logo}
									className="min-w-12 min-h-12 object-cover clan"
								/>
							) : (
								// eslint-disable-next-line react/jsx-no-useless-fragment
								<>
									{currentClan?.clan_name && (
										<div className="w-[48px] h-[48px] bg-bgTertiary rounded-full flex justify-center items-center text-contentSecondary text-[20px] clan">
											{currentClan.clan_name.charAt(0).toUpperCase()}
										</div>
									)}
								</>
							)}
						</NavLinkComponent>
					</NavLink>
				)}

				<div
					className="relative py-2"
					onClick={() => {
						setOpenListClans(!openListClans);
					}}
				>
					{/* <Image src={`/assets/images/icon-create-clan.svg`} alt={'logoMezon'} width={48} height={48} className="cursor-pointer" /> */}
					<div className="size-12 dark:bg-bgPrimary bg-[#E1E1E1] flex justify-center items-center rounded-full cursor-pointer hover:rounded-xl dark:hover:bg-slate-800 hover:bg-bgLightModeButton  transition-all duration-200 ">
						<p className="text-2xl font-bold text-[#155EEF]">+</p>
					</div>
					<div className="absolute bottom-0 right-0 top-0 left-[60px] z-10 bg-bgSecondary">
						<ModalListClans
							options={clans}
							showModal={openListClans}
							idSelectedClan={currentClan?.clan_id}
							onChangeClan={handleChangeClan}
							createClan={openCreateClanModal}
							onClose={() => setOpenListClans(false)}
						/>
					</div>
				</div>
			</div>
			<MainContent />
			<MessageModalImage />
		</div>
	);
}

export default MyApp;
