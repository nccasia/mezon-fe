import { useCategory, useClanRestriction, useEscapeKey, useOnClickOutside, UserRestrictionZone } from '@mezon/core';
import { categoriesActions, channelsActions, defaultNotificationCategoryActions, selectCategoryIdSortChannel, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelThreads, EPermission, ICategory, ICategoryChannel, IChannel, MouseButton } from '@mezon/utils';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import CategorySetting from '../../CategorySetting';
import { Coords } from '../../ChannelLink';
import ModalConfirm from '../../ModalConfirm';
import PanelCategory from '../../PanelCategory';
import ChannelListItem from '../ChannelListItem';

type CategorizedChannelsProps = {
	category: ICategoryChannel;
};

const CategorizedChannels: React.FC<CategorizedChannelsProps> = ({ category }) => {
	const [hasManageChannelPermission, { isClanOwner }] = useClanRestriction([EPermission.manageChannel]);
	const [hasAdminPermission] = useClanRestriction([EPermission.administrator]);
	const [hasClanPermission] = useClanRestriction([EPermission.manageClan]);
	const [isShowPanelCategory, setIsShowPanelCategory] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0
	});
	const [showModal, setShowModal] = useState(false);
	const [isShowCategorySetting, setIsShowCategorySetting] = useState<boolean>(false);
	const [isShowCategoryChannels, setIsShowCategoryChannels] = useState<boolean>(true);
	const categoryIdSortChannel = useSelector(selectCategoryIdSortChannel);
	const { handleDeleteCategory } = useCategory();
	const dispatch = useAppDispatch();

	const isShowCreateChannel = isClanOwner || hasAdminPermission || hasManageChannelPermission || hasClanPermission;

	const handleMouseClick = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		const windowHeight = window.innerHeight;

		if (event.button === MouseButton.RIGHT) {
			await dispatch(defaultNotificationCategoryActions.getDefaultNotificationCategory({ categoryId: category?.id ?? '' }));
			const distanceToBottom = windowHeight - event.clientY;
			setCoords({ mouseX, mouseY, distanceToBottom });
			setIsShowPanelCategory(!isShowPanelCategory);
		}
	};

	useEscapeKey(() => dispatch(channelsActions.openCreateNewModalChannel(false)));

	const handleToggleCategory = () => {
		setIsShowCategoryChannels(!isShowCategoryChannels);
	};

	const handleCloseCategorySetting = () => {
		setIsShowCategorySetting(false);
	};

	const handleSortByName = () => {
		dispatch(
			categoriesActions.setCategoryIdSortChannel({ isSortChannelByCategoryId: !categoryIdSortChannel[category.id], categoryId: category.id })
		);
	};

	const openModalCreateNewChannel = (paramCategory: ICategory) => {
		dispatch(channelsActions.openCreateNewModalChannel(true));
		dispatch(channelsActions.getCurrentCategory(paramCategory));
	};

	const handleOpenCreateChannelModal = (category: ICategoryChannel) => {
		setIsShowCategoryChannels(true);
		openModalCreateNewChannel(category);
	};

	const openModalDeleteCategory = () => {
		setShowModal(true);
		setIsShowPanelCategory(false);
	};

	const confirmDeleteCategory = async () => {
		handleDeleteCategory({ category });
		setShowModal(false);
	};

	useOnClickOutside(panelRef, () => setIsShowPanelCategory(false));

	useEscapeKey(() => setIsShowPanelCategory(false));

	return (
		<div>
			{category.category_name && (
				<div className="flex flex-row px-2 relative gap-1" onMouseDown={handleMouseClick} ref={panelRef} role={'button'}>
					<button
						onClick={() => {
							handleToggleCategory();
						}}
						className="dark:text-contentTertiary text-colorTextLightMode flex items-center px-0.5 w-full font-title tracking-wide dark:hover:text-gray-100 hover:text-black uppercase text-sm font-semibold"
					>
						{isShowCategoryChannels ? <Icons.ArrowDown /> : <Icons.ArrowRight />}
						<span className="one-line">{category.category_name}</span>
					</button>
					<button
						onClick={handleSortByName}
						className="focus-visible:outline-none dark:text-contentTertiary text-colorTextLightMode dark:hover:text-white hover:text-black"
					>
						<Icons.UpDownIcon />
					</button>
					<UserRestrictionZone policy={isShowCreateChannel}>
						<button
							className="focus-visible:outline-none dark:text-contentTertiary text-colorTextLightMode dark:hover:text-white hover:text-black"
							onClick={() => handleOpenCreateChannelModal(category)}
						>
							<Icons.Plus />
						</button>
					</UserRestrictionZone>

					{isShowPanelCategory && (
						<PanelCategory
							coords={coords}
							setIsShowPanelChannel={setIsShowPanelCategory}
							onDeleteCategory={openModalDeleteCategory}
							setOpenSetting={setIsShowCategorySetting}
							category={category}
						/>
					)}

					{showModal && (
						<ModalConfirm
							handleCancel={() => setShowModal(false)}
							modalName={category.category_name || ''}
							handleConfirm={confirmDeleteCategory}
							title="delete"
							buttonName="Delete category"
							message="This cannot be undone"
							customModalName="Category"
						/>
					)}

					{isShowCategorySetting && <CategorySetting onClose={handleCloseCategorySetting} category={category} />}
				</div>
			)}
			{isShowCategoryChannels && (
				<div className="mt-[5px] space-y-0.5 text-contentTertiary">
					{category?.channels
						?.filter((channel: IChannel) => {
							const categoryIsOpen = isShowCategoryChannels;
							return categoryIsOpen || channel?.unread;
						})
						.map((channel: IChannel) => {
							return <ChannelListItem key={channel.id} channel={channel as ChannelThreads} />;
						})}
				</div>
			)}
		</div>
	);
};

export default CategorizedChannels;
