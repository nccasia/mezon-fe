import {UserRestrictionZone, useCategory, useClanRestriction, useEscapeKey, useOnClickOutside} from '@mezon/core';
import { categoriesActions, channelsActions, selectCategoryIdSortChannel, selectCurrentClan, selectTheme, useAppDispatch } from '@mezon/store';
import {ChannelThreads, EPermission, ICategory, ICategoryChannel, IChannel, MouseButton} from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import {useMemo, useRef, useState} from 'react';
import { useSelector } from 'react-redux';
import { Icons }  from "@mezon/ui";
import { CreateNewChannelModal } from '../CreateChannelModal';
import { Events } from './ChannelListComponents';
import ChannelListItem from './ChannelListItem';
import {Coords} from "../ChannelLink";
import PanelCategory from "../PanelCategory";
import CategorySetting from "../CategorySetting";
export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function ChannelList({ channelCurrentType }: { readonly channelCurrentType?: number }) {
	const dispatch = useAppDispatch();
	const { categorizedChannels } = useCategory();
	const appearanceTheme = useSelector(selectTheme);
	const currentClan = useSelector(selectCurrentClan);
	const [hasManageChannelPermission, { isClanOwner }] = useClanRestriction([EPermission.manageChannel]);
	const [hasAdminPermission] = useClanRestriction([EPermission.administrator]);
  const [isShowPanelCategory, setIsShowPanelCategory] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<Coords>({
    mouseX: 0,
    mouseY: 0,
    distanceToBottom: 0,
  });
  const [isShowCategorySetting, setIsShowCategorySetting] = useState<boolean> (false);
  const [clickedCategoryId, setClickedCategoryId] = useState<string | null> (null);
  const clickedCategory = useMemo(() => {
    return categorizedChannels.find(category => category.category_id === clickedCategoryId) as ICategory
  }, [clickedCategoryId, categorizedChannels])
	const [hasClanPermission] = useClanRestriction([EPermission.manageClan]);

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

	const isShowCreateChannel = isClanOwner || hasAdminPermission || hasManageChannelPermission || hasClanPermission;

	useEscapeKey(() => dispatch(channelsActions.openCreateNewModalChannel(false)));
  
  const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, category: ICategory) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY + window.screenY;
    const windowHeight = window.innerHeight;
    
    if (event.button === MouseButton.RIGHT) {
      setClickedCategoryId(category?.category_id || '')
      event.stopPropagation();
      const distanceToBottom = windowHeight - event.clientY;
      setCoords({ mouseX, mouseY, distanceToBottom });
      setIsShowPanelCategory(!isShowPanelCategory);
    }
  };
  
  const handleOpenCreateChannelModal = (category: ICategoryChannel) => {
    handleToggleCategory(category, true);
    openModalCreateNewChannel(category);
  }
  
  const handleCloseCategorySetting = () => {
    setIsShowCategorySetting(false);
  }
  
  return (
    <>
      <div
        onContextMenu={(event) => event.preventDefault()}
        className={`overflow-y-scroll overflow-x-hidden w-[100%] h-[100%] pb-[10px] ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
        id="channelList"
        role="button"
      >
        {<CreateNewChannelModal />}
        {currentClan?.banner && (
          <div className="h-[136px]">
            {currentClan?.banner && <img src={currentClan?.banner} alt="imageCover" className="h-full w-full object-cover" />}
          </div>
        )}
        <div className="self-stretch h-fit flex-col justify-start items-start gap-1 p-2 flex">
          <Events />
        </div>
        <hr className="h-[0.08px] w-full dark:border-borderDivider border-white mx-2" />
        <div
          className={`overflow-y-scroll flex-1 pt-3 space-y-[21px]  text-gray-300 scrollbar-hide ${channelCurrentType === ChannelType.CHANNEL_TYPE_VOICE ? 'pb-[230px]' : 'pb-[120px]'}`}
        >
          {categorizedChannels.map((category: ICategoryChannel) => (
            <div key={category.id}>
              {category.category_name && (
                <div
                  className="flex flex-row px-2 relative gap-1"
                  onMouseDown={(event) => handleMouseClick(event, category as ICategory)}
                >
                  <button
                    onClick={() => {
                      handleToggleCategory(category);
                    }}
                    className="dark:text-[#AEAEAE] text-colorTextLightMode flex items-center px-0.5 w-full font-title tracking-wide dark:hover:text-gray-100 hover:text-black uppercase text-sm font-semibold"
                  >
                    {!categoriesState[category.id] ? <Icons.ArrowDown /> : <Icons.ArrowRight defaultSize="text-[16px]" />}
                    <span className='one-line'>
                      {category.category_name}
                    </span>
                  </button>
                  <button
                    onClick={() => handleSortByName(category.category_id ?? '')}
                    className="focus-visible:outline-none dark:text-[#AEAEAE] text-colorTextLightMode dark:hover:text-white hover:text-black"
                  >
                    <Icons.UpDownIcon />
                  </button>
                  <UserRestrictionZone policy={isShowCreateChannel}>
                    <button
                      className="focus-visible:outline-none"
                      onClick={() => handleOpenCreateChannelModal(category)}
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
      
      {isShowPanelCategory && (
        <PanelCategory
          coords={coords}
          setIsShowPanelChannel={setIsShowPanelCategory}
          setOpenSetting={setIsShowCategorySetting}
        />
      )}
      
      {isShowCategorySetting && (
        <CategorySetting onClose={handleCloseCategorySetting} category={clickedCategory}/>
      )}
    </>
		
	);
}

export default ChannelList;
