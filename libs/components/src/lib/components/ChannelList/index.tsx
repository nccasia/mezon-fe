import { UserRestrictionZone, useApp, useCategory, useClanRestriction, useClans, useEscapeKey } from '@mezon/core';
import { categoriesActions, channelsActions, selectCategoryIdSortChannel, useAppDispatch } from '@mezon/store';
import { ChannelThreads, EPermission, ICategory, ICategoryChannel, IChannel } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CreateNewChannelModal } from '../CreateChannelModal';
import * as Icons from '../Icons';
import { Events } from './ChannelListComponents';
import ChannelListItem from './ChannelListItem';
export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function ChannelList({ channelCurrentType }: { readonly channelCurrentType?: number }) {
	const dispatch = useAppDispatch();
	const { categorizedChannels } = useCategory();
	const { appearanceTheme } = useApp();
	const { currentClan } = useClans();
	const [hasManageChannelPermission, { isClanCreator }] = useClanRestriction([EPermission.manageChannel]);

	const categoryIdSortChannel = useSelector(selectCategoryIdSortChannel);

	const [categoriesState, setCategoriesState] = useState<CategoriesState>(
		categorizedChannels.reduce((acc, category) => {
			acc[category.id] = false;
			return acc;
		}, {} as CategoriesState),
	);

	const handleToggleCategory = (category: ICategoryChannel, setToTrue?: boolean) => {
		if (setToTrue) {
			setCategoriesState((prevState) => ({
				...prevState,
				[category.id]: prevState[category.id],
			}));
		} else {
			setCategoriesState((prevState) => ({
				...prevState,
				[category.id]: !prevState[category.id],
			}));
		}
	};

	const handleSortByName = (categoryId: string) => {
		dispatch(categoriesActions.setCategoryIdSortChannel({ isSortChannelByCategoryId: !categoryIdSortChannel[categoryId], categoryId }));
	};

	const openModalCreateNewChannel = (paramCategory: ICategory) => {
		dispatch(channelsActions.openCreateNewModalChannel(true));
		dispatch(channelsActions.getCurrentCategory(paramCategory));
	};

	useEscapeKey(() => dispatch(channelsActions.openCreateNewModalChannel(false)));

	return (
		<div
			onContextMenu={(event) => event.preventDefault()}
			className={`overflow-y-scroll overflow-x-hidden w-[100%] h-[100%] pb-[10px] ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
			id="channelList"
			role="button"
		>
			{<CreateNewChannelModal />}
			{currentClan?.banner && (
				<div className="h-[136px]">{currentClan?.banner && <img src={currentClan?.banner} alt="imageCover" className="h-full w-full object-cover" />}</div>
			)}
			<div className="self-stretch h-fit flex-col justify-start items-start gap-1 p-2 flex">
				<Events />
			</div>
			<hr className="h-[0.08px] w-[272px] dark:border-borderDivider border-white mx-2" />
			<div
				className={`overflow-y-scroll flex-1 pt-3 space-y-[21px]  text-gray-300 scrollbar-hide ${channelCurrentType === ChannelType.CHANNEL_TYPE_VOICE ? 'pb-[230px]' : 'pb-[120px]'}`}
			>
				{categorizedChannels.map((category: ICategoryChannel) => (
					<div key={category.id}>
						{category.category_name && (
							<div className="flex flex-row px-2 relative gap-1">
								<button
									onClick={() => {
										handleToggleCategory(category);
									}}
									className="dark:text-[#AEAEAE] text-colorTextLightMode flex items-center px-0.5 w-full font-title tracking-wide dark:hover:text-gray-100 hover:text-black uppercase text-sm font-semibold"
								>
									{!categoriesState[category.id] ? <Icons.ArrowDown /> : <Icons.ArrowRight defaultSize="text-[16px]" />}
									{category.category_name}
								</button>
								<button
									onClick={() => handleSortByName(category.category_id ?? '')}
									className="focus-visible:outline-none dark:text-[#AEAEAE] text-colorTextLightMode dark:hover:text-white hover:text-black"
								>
									<Icons.UpDownIcon />
								</button>
								<UserRestrictionZone policy={isClanCreator || hasManageChannelPermission}>
									<button
										className="focus-visible:outline-none"
										onClick={() => {
											handleToggleCategory(category, true);
											openModalCreateNewChannel(category);
										}}
									>
										<Icons.Plus />
									</button>
								</UserRestrictionZone>
							</div>
						)}
						{!categoriesState[category.id] && (
							<div className="mt-[5px] space-y-0.5 text-[#AEAEAE]">
								{category?.channels
									?.filter((channel: IChannel) => {
										const categoryIsOpen = !categoriesState[category.id];
										return categoryIsOpen || channel?.unread;
									})
									.map((channel: IChannel) => {
										return <ChannelListItem key={channel.id} channel={channel as ChannelThreads} />;
									})}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export default ChannelList;
