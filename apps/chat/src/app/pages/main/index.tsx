import { ModalCreateClan, ModalListClans, NavLinkComponent, SearchModal } from '@mezon/components';
import { useAppNavigation, useFriends, useMenu } from '@mezon/core';
import { gifsStickerEmojiActions, reactionActions, referencesActions, selectAllClans, selectCurrentChannel, selectCurrentClan } from '@mezon/store';
import { Image } from '@mezon/ui';
import { EmojiPlaces, SubPanelName } from '@mezon/utils';
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
	const handleClickOutside = () => {
		dispatch(referencesActions.setIdMessageToJump(''));
		dispatch(gifsStickerEmojiActions.setSubPanelActive(SubPanelName.NONE));
		dispatch(reactionActions.setReactionRightState(false));
		dispatch(reactionActions.setReactionBottomState(false));
		dispatch(referencesActions.setOpenOptionMessageState(false));
		dispatch(reactionActions.setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION_NONE));
		dispatch(reactionActions.setReactionBottomStateResponsive(false));
	};

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

	return (
		<div onClick={handleClickOutside} className="flex h-screen text-gray-100 overflow-hidden relative">
			<div
				className={`overflow-visible py-4 px-3 space-y-2 bg-bgPrimary scrollbar-hide  ${closeMenu ? (statusMenu ? '' : 'hidden') : ''}`}
				onClick={handleMenu}
				id="menu"
			>
				<NavLink to="/chat/direct/friends">
					<NavLinkComponent active={pathName.includes('direct')}>
						<div>
							<Image src={`/assets/images/icon-logo-mezon.svg`} alt={'logoMezon'} width={48} height={48} className="clan" />
							{quantityPendingRequest !== 0 && (
								<div className="absolute border-[4px] border-bgPrimary w-[24px] h-[24px] rounded-full bg-colorDanger text-[#fff] font-bold text-[11px] flex items-center justify-center top-7 right-[-6px]">
									{quantityPendingRequest}
								</div>
							)}
						</div>
					</NavLinkComponent>
				</NavLink>
				<div className="py-2 border-t-2 border-t-borderDefault" style={{ marginTop: '16px' }}></div>
				{currentClan?.id && (
					<NavLink
						to={`${currentChannel?.id ? `/chat/clans/${currentClan.id}/channels/${currentChannel?.id}` : `/chat/clans/${currentClan.id}`}`}
					>
						<NavLinkComponent active={!pathName.includes('direct')}>
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
					<div className="size-12 bg-[#1E1E1E] flex justify-center items-center rounded-full cursor-pointer hover:rounded-xl hover:bg-slate-800 transition-all duration-200 ">
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
		</div>
	);
}

export default MyApp;
