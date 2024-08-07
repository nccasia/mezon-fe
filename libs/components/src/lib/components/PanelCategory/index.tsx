import {Coords} from "../ChannelLink";
import {EPermission, ICategory} from "@mezon/utils";
import {useEffect, useRef, useState} from "react";
import GroupPanels from "../PanelChannel/GroupPanels";
import ItemPanel from "../PanelChannel/ItemPanel";
import {Dropdown} from "flowbite-react";
import {notificationTypesList} from "../PanelChannel";
import {useClanRestriction, useOnClickOutside, UserRestrictionZone} from "@mezon/core";

interface IPanelCategoryProps {
  coords: Coords,
  category?: ICategory,
  onDeleteCategory?: () => void;
  setIsShowPanelChannel: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenSetting: React.Dispatch<React.SetStateAction<boolean>>;
}

const PanelCategory: React.FC<IPanelCategoryProps> = ({coords, category, onDeleteCategory, setIsShowPanelChannel, setOpenSetting}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [positionTop, setPositionTop] = useState(false);
  const [hasManageChannelPermission, { isClanOwner }] = useClanRestriction([EPermission.manageChannel]);
  const [hasAdminPermission] = useClanRestriction([EPermission.administrator]);
  const hasManageCategoryPermission = isClanOwner || hasAdminPermission || hasManageChannelPermission;
  
  useEffect(() => {
    const heightPanel = panelRef.current?.clientHeight;
    if (heightPanel && heightPanel > coords.distanceToBottom) {
      setPositionTop(true);
    }
  }, [coords.distanceToBottom]);
  
  const handleOpenSetting = () => {
    setOpenSetting (true);
    setIsShowPanelChannel(false);
  }
  
  useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));
  
  return (
    <>
      <div
        ref={panelRef}
        role={'button'}
        style={{ left: coords.mouseX, bottom: positionTop ? '12px' : 'auto', top: positionTop ? 'auto' : coords.mouseY }}
        className="fixed top-full dark:bg-bgProfileBody bg-white rounded-sm z-10 w-[200px] py-[10px] px-[10px] shadow-md"
      >
        <GroupPanels>
          <ItemPanel children="Mark As Read" />
        </GroupPanels>
        <GroupPanels>
          <ItemPanel children="Collapse Category" type={'checkbox'}/>
          <ItemPanel children="Collapse All Categories" />
        </GroupPanels>
        <GroupPanels>
          <Dropdown
            trigger="hover"
            dismissOnClick={false}
            renderTrigger={() => (
              <div>
                <ItemPanel
                  children={'Mute Category'}
                  dropdown="change here"
                />
              </div>
            )}
            label=""
            placement="right-start"
            className="dark:!bg-bgProfileBody bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
          >
            <ItemPanel children="For 15 Minutes"/>
            <ItemPanel children="For 1 Hour"/>
            <ItemPanel children="For 3 Hour"/>
            <ItemPanel children="For 8 Hour"/>
            <ItemPanel children="For 24 Hour"/>
            <ItemPanel children="Until I turn it back on"/>
          </Dropdown>
          <Dropdown
            trigger="hover"
            dismissOnClick={false}
            renderTrigger={() => (
              <div>
                <ItemPanel children="Notification Settings" dropdown="change here" />
              </div>
            )}
            label=""
            placement="right-start"
            className="dark:!bg-bgProfileBody bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
          >
            <ItemPanel
              children="Use Category Default"
              type="radio"
              name="NotificationSetting"
              defaultNotifi={true}
            />
            {notificationTypesList.map(notification => (
              <ItemPanel
                children={notification.label}
                notificationId={notification.value}
                type="radio"
                name="NotificationSetting"
                key={notification.value}
              />
            ))}
          </Dropdown>
        </GroupPanels>
        
        <UserRestrictionZone policy={hasManageCategoryPermission}>
          <GroupPanels>
            <ItemPanel children={'Edit Category'} onClick={handleOpenSetting}/>
            <ItemPanel children={'Delete Category'} onClick={onDeleteCategory} danger/>
          </GroupPanels>
        </UserRestrictionZone>
      </div>
    </>
  )
}

export default PanelCategory