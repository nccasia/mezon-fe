import { useAuth, useCategory, useClans, useOnClickOutside } from '@mezon/core';
import { categoriesActions, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { ApiCreateCategoryDescRequest } from 'mezon-js/api.gen';
import { useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import ClanSetting from '../ClanSettings';
import * as Icons from '../Icons';
import ModalInvite from '../ListMemberInvite/modalInvite';
import SearchModal from '../SearchModal';
import ModalNotificationSetting from '../notificationSetting';
import ItemModal from './ItemModal';
import ModalCreateCategory from './ModalCreateCategory';

export type ClanHeaderProps = {
	name?: string;
	type: string;
	bannerImage?: string;
};

function ClanHeader({ name, type, bannerImage }: ClanHeaderProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const modalRef = useRef<HTMLDivElement | null>(null);
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const { categorizedChannels } = useCategory();
	const { userProfile } = useAuth();
	const { currentClan } = useClans();
	const [openInviteClanModal, closeInviteClanModal] = useModal(() => (
		<ModalInvite onClose={closeInviteClanModal} open={true} channelID={channelId || ''} />
	));
	const [openSearchModal, closeSearchModal] = useModal(() => <SearchModal onClose={closeSearchModal} open={true} />);

	const [openCreateCate, setOpenCreateCate] = useState(false);
	const [openServerSettings, setOpenServerSettings] = useState(false);
	const [isShowModalPannelClan, setIsShowModalPannelClan] = useState<boolean>(false);

	const [openNotiSettingModal, closeNotiSettingModal] = useModal(() => (
		<ModalNotificationSetting onClose={closeNotiSettingModal} open={true} channelID={channelId || ''} />
	));
	const channelId = categorizedChannels.at(0)?.channels.at(0)?.channel_id;

	const onClose = () => {
		setOpenCreateCate(false);
	};

	const handleCreateCate = async (nameCate: string) => {
		const body: ApiCreateCategoryDescRequest = {
			clan_id: currentClanId?.toString(),
			category_name: nameCate,
		};
		await dispatch(categoriesActions.createNewCategory(body));
		onClose();
	};
	const handleInputFocus = () => {
		openSearchModal();
		inputRef.current?.blur();
	};

	const handleShowModalClan = () => {
		setIsShowModalPannelClan(!isShowModalPannelClan);
	};

	const handleShowCreateCategory = () => {
		setOpenCreateCate(true);
		setIsShowModalPannelClan(false);
	};

	const handleShowInviteClanModal = () => {
		openInviteClanModal();
		setIsShowModalPannelClan(false);
	};

	const handleShowServerSettings = () => {
		setOpenServerSettings(true);
		setIsShowModalPannelClan(false);
	};

	useOnClickOutside(modalRef, () => setIsShowModalPannelClan(false));

	return (
		<>
			{type === 'direct' ? (
				<div className="px-3 font-semibold text-white h-heightHeader flex items-center shadow border-b-[1px] dark:border-bgTertiary border-gray-200">
					<input
						ref={inputRef}
						placeholder="Find or start a conversation"
						className={`font-[400] px-[16px] rounded dark:text-white text-black outline-none text-[14px] w-full dark:bg-bgTertiary bg-[#E1E1E1] dark:border-borderDefault h-[36px]`}
						type="text"
						onFocus={handleInputFocus}
					/>
				</div>
			) : (
				<div className={`h-[60px] relative bg-gray-950`}>
					<div ref={modalRef} className={`relative h-[60px] top-0`} onClick={handleShowModalClan}>
						<div
							className={`cursor-pointer w-full p-3 left-0 top-0 absolute flex h-heightHeader justify-between items-center gap-2 dark:bg-bgSecondary bg-bgLightSecondary dark:hover:bg-[#35373C] hover:bg-[#E2E7F6] shadow border-b-[1px] dark:border-bgTertiary border-bgLightSecondary`}
						>
							<p className="dark:text-white text-black text-base font-semibold select-none">{name?.toLocaleUpperCase()}</p>
							<button className="w-6 h-8 flex flex-col justify-center">
								<Icons.ArrowDown />
							</button>
						</div>
						{isShowModalPannelClan && (
							<div
								onClick={(e) => e.stopPropagation()}
								className="dark:bg-bgProfileBody bg-white p-2 rounded w-[250px] absolute left-1/2 top-[68px] z-[9999] transform translate-x-[-50%]"
							>
								<div className="flex flex-col pb-1 mb-1 border-b-[0.08px] border-b-[#6A6A6A] last:border-b-0 last:mb-0 last:pb-0">
									<ItemModal onClick={handleShowCreateCategory} children="Create Category" endIcon={<Icons.CreateCategoryIcon />} />
									<ItemModal
										onClick={handleShowInviteClanModal}
										children="Invite People"
										endIcon={<Icons.AddPerson className="dark:text-[#AEAEAE] text-colorTextLightMode group-hover:text-white" />}
									/>
									{userProfile?.user?.id === currentClan?.creator_id && (
										<ItemModal
											onClick={handleShowServerSettings}
											children="Server Settings"
											endIcon={
												<Icons.SettingProfile className="dark:text-[#AEAEAE] text-colorTextLightMode group-hover:text-white" />
											}
										/>
									)}
									<ItemModal
										onClick={() => {openNotiSettingModal(); setIsShowModalPannelClan(false);}}
										children="Notification Settings"
										endIcon={<Icons.Bell className="dark:text-[#AEAEAE] text-colorTextLightMode group-hover:text-white" />}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			<ClanSetting
				// open={openServerSettings}
				open={openServerSettings}
				onClose={() => {
					setOpenServerSettings(false);
				}}
			/>

			<ModalCreateCategory openCreateCate={openCreateCate} onClose={onClose} onCreateCategory={handleCreateCate} />
		</>
	);
}

export default ClanHeader;
