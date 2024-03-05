import { ModalCreateClan, ModalListClans, NavLinkComponent } from '@mezon/components';
import { useAppNavigation, useFriends } from '@mezon/core';
import { selectAllClans, selectCurrentClan } from '@mezon/store';
import { Image } from '@mezon/ui';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { MainContent } from './MainContent';

function MyApp() {
	const clans = useSelector(selectAllClans);
	const currentClan = useSelector(selectCurrentClan);
	const [openListClans, setOpenListClans] = useState(false);
	const [openCreateClan, setOpenCreateClans] = useState(false);
	const { navigate, toClanPage } = useAppNavigation();
	const pathName = useLocation().pathname;

	const handleChangeClan = (clanId: string) => {
		navigate(toClanPage(clanId));
	};
	const handleOpenCreate = () => {
		setOpenCreateClans(true);
	};

	const { quantityPendingRequest } = useFriends();

	return (
		<div className="flex h-screen text-gray-100 overflow-hidden">
			<div className="overflow-visible py-4 px-3 space-y-2 bg-bgPrimary scrollbar-hide">
				<NavLink to="/chat/direct/friends">
					<NavLinkComponent active={pathName.includes('direct')}>
						<div>
							<Image src={`/assets/images/icon-logo-mezon.svg`} alt={'logoMezon'} width={48} height={48} />
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
					<NavLink to={`/chat/clans/${currentClan.id}`}>
						<NavLinkComponent active={!pathName.includes('direct')}>
							{currentClan?.logo ? (
								<Image
									src={currentClan?.logo || ''}
									alt={currentClan?.clan_name || ''}
									placeholder="blur"
									width={48}
									style={{ borderRadius: '50%' }}
									blurDataURL={currentClan?.logo}
								/>
							) : (
								// eslint-disable-next-line react/jsx-no-useless-fragment
								<>
									{currentClan?.clan_name && (
										<div className="w-[48px] h-[48px] bg-bgTertiary rounded-full flex justify-center items-center text-contentSecondary text-[20px]">
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
					<Image src={`/assets/images/icon-create-clan.svg`} alt={'logoMezon'} width={48} height={48} />
					<div className="absolute bottom-0 right-0 top-0 left-[60px] z-10 bg-bgSecondary">
						<ModalListClans
							options={clans}
							showModal={openListClans}
							idSelectedClan={currentClan?.clan_id}
							onChangeClan={handleChangeClan}
							createClan={handleOpenCreate}
							onClose={() => setOpenListClans(false)}
						/>
					</div>
				</div>
			</div>
			<MainContent />
			<ModalCreateClan
				open={openCreateClan}
				onClose={() => {
					setOpenCreateClans(false);
				}}
			/>
		</div>
	);
}

export default MyApp;
