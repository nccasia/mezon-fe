import { Coords } from "../ChannelLink";
import { ENotificationTypes, EPermission, ICategory } from "@mezon/utils";
import { useEffect, useRef, useState } from "react";
import GroupPanels from "../PanelChannel/GroupPanels";
import ItemPanel from "../PanelChannel/ItemPanel";
import { Dropdown } from "flowbite-react";
import { notificationTypesList } from "../PanelChannel";
import { useClanRestriction, UserRestrictionZone } from "@mezon/core";
import {
	defaultNotificationCategoryActions,
	selectCurrentClanId,
	selectDefaultNotificationCategory,
	SetDefaultNotificationPayload,
	useAppDispatch,
	useAppSelector
} from "@mezon/store";
import { NotificationType } from "mezon-js";
import { format } from "date-fns";

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
	const dispatch = useAppDispatch();
	const defaultCategoryNotificationSetting = useAppSelector(selectDefaultNotificationCategory);
	const currentClanId = useAppSelector(selectCurrentClanId);
	const [muteUntil, setMuteUntil] = useState ('');
  
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
	
	const handleChangeSettingType = (notificationType: number) => {
		const payload: SetDefaultNotificationPayload = {
			category_id: category?.id,
			notification_type: notificationType,
			clan_id: currentClanId || ''
		};
		dispatch(defaultNotificationCategoryActions.setDefaultNotificationCategory(payload));
	}
	
	const handleScheduleMute = (duration: number) => {
		if(duration !== Infinity) {
			const now = new Date();
			const muteTime = new Date(now.getTime() + duration);
			const muteTimeISO = muteTime.toISOString();
			const payload: SetDefaultNotificationPayload = {
				category_id: category?.id,
				notification_type: defaultCategoryNotificationSetting?.notification_setting_type,
				time_mute: muteTimeISO,
				clan_id: currentClanId || ''
			};
			dispatch(defaultNotificationCategoryActions.setDefaultNotificationCategory(payload));
		} else {
			const payload: SetDefaultNotificationPayload = {
				category_id: category?.id,
				notification_type: defaultCategoryNotificationSetting?.notification_setting_type,
				clan_id: currentClanId || '',
				active: 0,
			};
			dispatch(defaultNotificationCategoryActions.setMuteCategory(payload));
		}
	}
	
	const handleMuteCategory = (active: number) => {
		const payload: SetDefaultNotificationPayload = {
			category_id: category?.id,
			notification_type: defaultCategoryNotificationSetting?.notification_setting_type,
			clan_id: currentClanId || '',
			active: active,
		};
		dispatch(defaultNotificationCategoryActions.setMuteCategory(payload));
	}
	
	useEffect (() => {
		if(defaultCategoryNotificationSetting?.active) {
			setMuteUntil('')
		} else if(defaultCategoryNotificationSetting?.time_mute) {
			const muteTime = new Date(defaultCategoryNotificationSetting.time_mute);
			const now = new Date();
			if(muteTime > now) {
				const timeDifference = muteTime.getTime() - now.getTime();
				const formattedTimeDifference = format(muteTime, 'dd/MM, HH:mm');
				setMuteUntil(`Muted until ${formattedTimeDifference}`);
				setTimeout(() => {
					const payload: SetDefaultNotificationPayload = {
						category_id: category?.id,
						notification_type: defaultCategoryNotificationSetting?.notification_setting_type ?? NotificationType.ALL_MESSAGE,
						clan_id: currentClanId || '',
						active: 1,
					};
					dispatch(defaultNotificationCategoryActions.setMuteCategory(payload));
				}, timeDifference)
			}
		}
	}, [defaultCategoryNotificationSetting]);
	
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
	        {(defaultCategoryNotificationSetting?.active === 1 || defaultCategoryNotificationSetting?.id === '0') ? (
		        <Dropdown
			        trigger="hover"
			        dismissOnClick={false}
			        renderTrigger={() => (
				        <div>
					        <ItemPanel
						        children={'Mute Category'}
						        dropdown="change here"
						        onClick={() => handleMuteCategory(0)}
					        />
				        </div>
			        )}
			        label=""
			        placement="right-start"
			        className="dark:!bg-bgProfileBody bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
		        >
			        <ItemPanel children="For 15 Minutes"  onClick={() => handleScheduleMute(15 * 60 * 1000)}/>
			        <ItemPanel children="For 1 Hour"  onClick={() => handleScheduleMute(60 * 60 * 1000)}/>
			        <ItemPanel children="For 3 Hour"  onClick={() => handleScheduleMute(3 * 60 * 60 * 1000)}/>
			        <ItemPanel children="For 8 Hour"  onClick={() => handleScheduleMute(8 * 60 * 60 * 1000)}/>
			        <ItemPanel children="For 24 Hour"  onClick={() => handleScheduleMute(24 * 60 * 60 * 1000)}/>
			        <ItemPanel children="Until I turn it back on" onClick={() => handleScheduleMute(Infinity)}/>
		        </Dropdown>
	        ) : (
						<ItemPanel children={'Unmute Category'} onClick={() => handleMuteCategory(1)} subText={muteUntil}/>)}
          
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
              children="Use Clan Default"
              type="radio"
              name="NotificationSetting"
              defaultNotifi={true}
              onClick={() => handleChangeSettingType(ENotificationTypes.DEFAULT)}
              checked={defaultCategoryNotificationSetting?.notification_setting_type === ENotificationTypes.DEFAULT}
            />
            {notificationTypesList.map(notification => (
              <ItemPanel
                children={notification.label}
                notificationId={notification.value}
                type="radio"
                name="NotificationSetting"
                key={notification.value}
                onClick={() => handleChangeSettingType(notification.value)}
                checked={defaultCategoryNotificationSetting?.notification_setting_type === notification.value}
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