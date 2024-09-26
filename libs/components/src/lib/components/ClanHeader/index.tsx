import { useAuth, useCategory, useChannelMembersActions, useClanRestriction, useEscapeKey, useOnClickOutside } from '@mezon/core';
import {
	categoriesActions,
	hasGrandchildModal,
	selectCurrentClan,
	selectCurrentClanId,
	selectCurrentVoiceChannelId,
	selectIsShowEmptyCategory,
	useAppDispatch
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EPermission } from '@mezon/utils';
import { ApiCreateCategoryDescRequest } from 'mezon-js/api.gen';
import { useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ClanSetting from '../ClanSettings';
import { ItemSetting } from '../ClanSettings/ItemObj';
import ModalInvite from '../ListMemberInvite/modalInvite';
import ModalConfirm from '../ModalConfirm';
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
	const [hasAdminPermission, { isClanOwner }] = useClanRestriction([EPermission.administrator]);
	const [hasClanPermission] = useClanRestriction([EPermission.manageClan]);
	const { removeMemberClan } = useChannelMembersActions();
	const { userProfile } = useAuth();
	const currentChannelId = useSelector(selectCurrentVoiceChannelId);
	const currentClan = useSelector(selectCurrentClan);
	const navigate = useNavigate();
	const [openInviteClanModal, closeInviteClanModal] = useModal(() => <ModalInvite onClose={closeInviteClanModal} open={true} />);
	const [openSearchModal, closeSearchModal] = useModal(() => <SearchModal onClose={closeSearchModal} open={true} />);

	const [openCreateCate, setOpenCreateCate] = useState(false);
	const [openServerSettings, setOpenServerSettings] = useState(false);
	const [isShowModalPanelClan, setIsShowModalPanelClan] = useState<boolean>(false);
	const hasChildModal = useSelector(hasGrandchildModal);
	const [openNotiSettingModal, closeNotiSettingModal] = useModal(() => <ModalNotificationSetting onClose={closeNotiSettingModal} open={true} />);
	const isShowEmptyCategory = useSelector(selectIsShowEmptyCategory);
	const [isShowLeaveClanPopup, setIsShowLeaveClanPopup] = useState(false);
	const toggleLeaveClanPopup = () => {
		setIsShowLeaveClanPopup(!isShowLeaveClanPopup);
		setIsShowModalPanelClan(false);
	};

	const onClose = () => {
		setOpenCreateCate(false);
	};

	const handleCreateCate = async (nameCate: string) => {
		const body: ApiCreateCategoryDescRequest = {
			clan_id: currentClanId?.toString(),
			category_name: nameCate
		};
		await dispatch(categoriesActions.createNewCategory(body));
		onClose();
	};
	const handleInputFocus = () => {
		openSearchModal();
		inputRef.current?.blur();
	};

	const handleShowModalClan = () => {
		setIsShowModalPanelClan(!isShowModalPanelClan);
	};

	const handleShowCreateCategory = () => {
		setOpenCreateCate(true);
		setIsShowModalPanelClan(false);
	};

	const handleShowInviteClanModal = () => {
		openInviteClanModal();
		setIsShowModalPanelClan(false);
	};

	const handleShowServerSettings = () => {
		setOpenServerSettings(true);
		setIsShowModalPanelClan(false);
	};

	useOnClickOutside(modalRef, () => setIsShowModalPanelClan(false));

	const hasPermissionCreateCategory = hasAdminPermission || isClanOwner || hasClanPermission;

	const hasPermissionChangeFull = isClanOwner || hasClanPermission || hasAdminPermission;
	useEscapeKey(() => {
		setIsShowModalPanelClan(false);
		if (!hasChildModal) {
			setOpenServerSettings(false);
		}
	});

	const handleLeaveClan = async () => {
		await removeMemberClan({ channelId: currentChannelId, clanId: currentClan?.clan_id as string, userIds: [userProfile?.user?.id as string] });
		toggleLeaveClanPopup();
		navigate('/mezon');
	};

	const toggleShowEmptyCategory = () => {
		if (isShowEmptyCategory) {
			dispatch(categoriesActions.setHideEmptyCategory());
		} else {
			dispatch(categoriesActions.setShowEmptyCategory());
		}
	};
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
							<p className="dark:text-white text-black text-base font-semibold select-none one-line">{name?.toLocaleUpperCase()}</p>
							<button className="w-6 h-8 flex flex-col justify-center">
								<Icons.ArrowDown />
							</button>
						</div>
						{isShowModalPanelClan && (
							<div
								onClick={(e) => e.stopPropagation()}
								className="dark:bg-bgProfileBody bg-white p-2 rounded w-[250px] absolute left-1/2 top-[68px] z-[9999] transform translate-x-[-50%] shadow-xl"
							>
								<div className="flex flex-col pb-1 mb-1 border-b-[0.08px] border-b-[#6A6A6A] last:border-b-0 last:mb-0 last:pb-0">
									{hasPermissionCreateCategory && (
										<ItemModal
											onClick={handleShowCreateCategory}
											children="Create Category"
											endIcon={<Icons.CreateCategoryIcon />}
										/>
									)}
									<ItemModal
										onClick={handleShowInviteClanModal}
										children="Invite People"
										endIcon={<Icons.AddPerson className="dark:text-[#AEAEAE] text-colorTextLightMode group-hover:text-white" />}
									/>
									<ItemModal
										onClick={handleShowServerSettings}
										children="Clan Settings"
										endIcon={
											<Icons.SettingProfile className="dark:text-[#AEAEAE] text-colorTextLightMode group-hover:text-white" />
										}
									/>
									<ItemModal
										onClick={() => {
											openNotiSettingModal();
											setIsShowModalPanelClan(false);
										}}
										children="Notification Settings"
										endIcon={<Icons.Bell className="dark:text-[#AEAEAE] text-colorTextLightMode group-hover:text-white" />}
									/>
									<button
										onClick={toggleShowEmptyCategory}
										className="flex items-center w-full justify-between rounded-sm hover:text-white group pr-2 hover:bg-bgSelectItem group"
									>
										<li className="text-[14px] dark:text-[#AEAEAE] text-colorTextLightMode group-hover:text-white font-medium w-full py-[6px] px-[8px] text-left cursor-pointer list-none ">
											Show Empty Categories
										</li>
										{/* <div className="flex items-center justify-center h-[18px] w-[18px]"> */}
										<input
											className="peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg
							 bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full
								after:bg-slate-500 after:transition-all checked:bg-blue-200 checked:after:left-4 checked:after:bg-blue-500
								 hover:bg-slate-400 after:hover:bg-slate-600 checked:hover:bg-blue-300 checked:after:hover:bg-blue-600
									focus:outline-none checked:focus:bg-blue-400 checked:after:focus:bg-blue-700 focus-visible:outline-none disabled:cursor-not-allowed
									 disabled:bg-slate-200 disabled:after:bg-slate-300"
											type="checkbox"
											checked={isShowEmptyCategory}
											id="id-c01"
											onChange={toggleShowEmptyCategory}
										/>
										{/* </div> */}
									</button>
									{!isClanOwner && (
										<button
											onClick={toggleLeaveClanPopup}
											className="flex items-center w-full justify-between rounded-sm hover:bg-red-600 text-red-600 hover:text-white group pr-2"
										>
											<li className="text-[14px]  font-medium w-full py-[6px] px-[8px] text-left cursor-pointer list-none ">
												Leave clan
											</li>
											<div className="flex items-center justify-center h-[18px] w-[18px]">
												<Icons.LeaveClanIcon className="text-red-600 group-hover:text-white" />
											</div>
										</button>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{isShowLeaveClanPopup && (
				<ModalConfirm
					handleCancel={toggleLeaveClanPopup}
					handleConfirm={handleLeaveClan}
					modalName={currentClan?.clan_name}
					title="leave"
					buttonName="Leave Clan"
				/>
			)}

			{openServerSettings && (
				<ClanSetting
					onClose={() => {
						setOpenServerSettings(false);
					}}
					initialSetting={hasPermissionChangeFull ? ItemSetting.OVERVIEW : ItemSetting.EMOJI}
				/>
			)}

			<ModalCreateCategory openCreateCate={openCreateCate} onClose={onClose} onCreateCategory={handleCreateCate} />
		</>
	);
}

export default ClanHeader;
