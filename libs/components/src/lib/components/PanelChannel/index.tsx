import { useAuth } from '@mezon/core';
import {
  notificationSettingActions,
  selectCurrentChannelId,
  selectCurrentClan,
  selectDefaultNotificationCategory, selectDefaultNotificationClan,
  selectnotificatonSelected,
  useAppDispatch
} from "@mezon/store";
import { IChannel } from '@mezon/utils';
import { format } from "date-fns";
import { Dropdown } from 'flowbite-react';
import { NotificationType } from "mezon-js";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { Coords } from '../ChannelLink';
import GroupPanels from './GroupPanels';
import ItemPanel from './ItemPanel';

type PanelChannel = {
	coords: Coords;
	channel: IChannel;
	onDeleteChannel: () => void;
	setOpenSetting: React.Dispatch<React.SetStateAction<boolean>>;
	setIsShowPanelChannel: React.Dispatch<React.SetStateAction<boolean>>;
};

const typeChannel = {
	text: 1,
	voice: 4,
};

export const notificationTypesList = [
  {
    label: 'All',
    value: NotificationType.ALL_MESSAGE
  },
  {
    label: 'Only @mention',
    value: NotificationType.MENTION_MESSAGE
  },
  {
    label: 'Nothing',
    value: NotificationType.NOTHING_MESSAGE
  },
]

const PanelChannel = ({ coords, channel, setOpenSetting, setIsShowPanelChannel, onDeleteChannel }: PanelChannel) => {
  const getNotificationChannelSelected = useSelector(selectnotificatonSelected);
  const dispatch = useAppDispatch();
  const currentChannelId = useSelector(selectCurrentChannelId);
  const currentClan = useSelector(selectCurrentClan);
	const { userProfile } = useAuth();
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionTop, setPositionTop] = useState(false);
  const [nameChildren, setNameChildren] = useState('');
  const [mutedUntil, setmutedUntil] = useState('');
  const [defaultNotifiName, setDefaultNotifiName] = useState('');
  const defaultNotificationCategory = useSelector(selectDefaultNotificationCategory);
  const defaultNotificationClan = useSelector(selectDefaultNotificationClan);
  
	const handleEditChannel = () => {
		setOpenSetting(true);
		setIsShowPanelChannel(false);
	};

	const handleDeleteChannel = () => {
		onDeleteChannel();
	};
  
  const handleScheduleMute = (duration: number) => {
    if (duration !== Infinity) {
      const now = new Date();
      const unmuteTime = new Date(now.getTime() + duration);
      const unmuteTimeISO = unmuteTime.toISOString();
      
      const body = {
        channel_id: currentChannelId || '',
        notification_type: getNotificationChannelSelected?.notification_setting_type || '',
        clan_id: currentClan?.clan_id || '',
        time_mute: unmuteTimeISO,
      };
      dispatch(notificationSettingActions.setNotificationSetting(body));
    } else {
      const body = {
        channel_id: currentChannelId || '',
        notification_type: getNotificationChannelSelected?.notification_setting_type || '',
        clan_id: currentClan?.clan_id || '',
        active: 0,
      };
      dispatch(notificationSettingActions.setMuteNotificationSetting(body));
    }
  };
  
  const muteOrUnMuteChannel = (active: number) => {
    const body = {
      channel_id: currentChannelId || '',
      notification_type: getNotificationChannelSelected?.notification_setting_type || '',
      clan_id: currentClan?.clan_id || '',
      active: active,
    };
    dispatch(notificationSettingActions.setMuteNotificationSetting(body));
  };
  
  const setNotification = (notificationType: string | undefined) => {
    if(notificationType) {
      const body = {
        channel_id: currentChannelId || '',
        notification_type: notificationType || '',
        clan_id: currentClan?.clan_id || '',
      };
      dispatch(notificationSettingActions.setNotificationSetting(body));
    } else {
      dispatch(notificationSettingActions.deleteNotiChannelSetting({ channel_id: currentChannelId || '', clan_id: currentClan?.clan_id || '' }));
    }
  };

	useEffect(() => {
		const heightPanel = panelRef.current?.clientHeight;
		if (heightPanel && heightPanel > coords.distanceToBottom) {
			setPositionTop(true);
		}
	}, [coords.distanceToBottom]);
  
  useEffect(() => {
    if (getNotificationChannelSelected?.active === 1) {
      setNameChildren('Mute Channel');
      setmutedUntil('');
    } else {
      setNameChildren('Unmute Channel');
      if (getNotificationChannelSelected?.time_mute) {
        const timeMute = new Date(getNotificationChannelSelected.time_mute);
        const currentTime = new Date();
        if (timeMute > currentTime) {
          const timeDifference = timeMute.getTime() - currentTime.getTime();
          const formattedDate = format(timeMute, 'dd/MM, HH:mm');
          setmutedUntil(`Muted until ${formattedDate}`);
          
          setTimeout(() => {
            const body = {
              channel_id: currentChannelId || '',
              notification_type: getNotificationChannelSelected?.notification_setting_type || '',
              clan_id: currentClan?.clan_id || '',
              active: 1,
            };
            dispatch(notificationSettingActions.setMuteNotificationSetting(body));
          }, timeDifference);
        }
      }
    }
    if (defaultNotificationCategory?.notification_setting_type) {
      setDefaultNotifiName(defaultNotificationCategory.notification_setting_type);
    } else if (defaultNotificationClan?.notification_setting_type) {
      setDefaultNotifiName(defaultNotificationClan.notification_setting_type);
    }
  }, [getNotificationChannelSelected, defaultNotificationCategory, defaultNotificationClan]);
  
  const checkOwnerChannel = useMemo(() => channel.creator_id === userProfile?.user?.id, [channel.creator_id, userProfile?.user?.id]);
  const checkOwnerClan = useMemo(() => currentClan?.creator_id === userProfile?.user?.id, [currentClan?.creator_id, userProfile?.user?.id]);

  return (
		<div
			ref={panelRef}
			style={{ left: coords.mouseX, bottom: positionTop ? '12px' : 'auto', top: positionTop ? 'auto' : coords.mouseY }}
			className="fixed top-full dark:bg-bgProfileBody bg-gray-100 rounded-sm shadow z-10 w-[200px] py-[10px] px-[10px]"
		>
			<GroupPanels>
				<ItemPanel children="Mark As Read" />
			</GroupPanels>
			<GroupPanels>
				<ItemPanel children="Invite People" />
				<ItemPanel children="Copy link" />
			</GroupPanels>
			{channel.type === typeChannel.voice && (
				<GroupPanels>
					<ItemPanel children="Open Chat" />
					<ItemPanel children="Hide Names" type="checkbox" />
				</GroupPanels>
			)}
			{channel.parrent_id === '0' ? (
				<>
					<GroupPanels>
            {getNotificationChannelSelected?.active === 1 ? (
              <Dropdown
                trigger="hover"
                dismissOnClick={false}
                renderTrigger={() => (
                  <div>
                    <ItemPanel
                      children={nameChildren}
                      dropdown="change here"
                      onClick={() => muteOrUnMuteChannel(0)}/>
                  </div>
                )}
                label=""
                placement="right-start"
                className="dark:!bg-bgProfileBody bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
              >
                <ItemPanel children="For 15 Minutes" onClick={() => handleScheduleMute(15 * 60 * 1000)}/>
                <ItemPanel children="For 1 Hour" onClick={() => handleScheduleMute(60 * 60 * 1000)}/>
                <ItemPanel children="For 3 Hour" onClick={() => handleScheduleMute(3 * 60 * 60 * 1000)}/>
                <ItemPanel children="For 8 Hour" onClick={() => handleScheduleMute(8 * 60 * 60 * 1000)}/>
                <ItemPanel children="For 24 Hour" onClick={() => handleScheduleMute(24 * 60 * 60 * 1000)}/>
                <ItemPanel children="Until I turn it back on" onClick={() => handleScheduleMute(Infinity)}/>
              </Dropdown>
            ) : (
              <ItemPanel
                children={nameChildren}
                onClick={() => muteOrUnMuteChannel(1)}
                muteTime={mutedUntil}
              />
            )}
						
						{channel.type === typeChannel.text && (
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
                  checked={getNotificationChannelSelected?.notification_setting_type === undefined}
                  defaultNotifiName={defaultNotifiName}
                  onClick={() => setNotification('')}
                />
                {notificationTypesList.map(notification => (
                  <ItemPanel
                    children={notification.label}
                    notificationId={notification.value}
                    type="radio"
                    name="NotificationSetting"
                    key={notification.value}
                    checked={getNotificationChannelSelected?.notification_setting_type === notification.value}
                    onClick={() => setNotification(notification.value)}
                  />
                ))}
							</Dropdown>
						)}
					</GroupPanels>

					{(checkOwnerChannel || checkOwnerClan) && (
						<GroupPanels>
							<ItemPanel onClick={handleEditChannel} children="Edit Channel" />
							<ItemPanel children="Duplicate Channel" />
							{channel.type === typeChannel.text && <ItemPanel children="Create Text Channel" />}
							{channel.type === typeChannel.voice && <ItemPanel children="Create Voice Channel" />}
							<ItemPanel onClick={handleDeleteChannel} children="Delete Channel" danger />
						</GroupPanels>
					)}
				</>
			) : (
				<>
					<GroupPanels>
						<Dropdown
							trigger="hover"
							dismissOnClick={false}
							renderTrigger={() => (
								<div>
									<ItemPanel children="Mute Thread" dropdown="change here" />
								</div>
							)}
							label=""
							placement="right-start"
							className="dark:!bg-bgProfileBody bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
						>
							<ItemPanel children="For 15 Minutes" />
							<ItemPanel children="For 1 Hour" />
							<ItemPanel children="For 3 Hour" />
							<ItemPanel children="For 8 Hour" />
							<ItemPanel children="For 24 Hour" />
							<ItemPanel children="Until I turn it back on" />
						</Dropdown>
						{channel.type === typeChannel.text && (
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
								className="dark:bg-[#323232] bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
							>
								<ItemPanel children="Use Category Default" type="radio" />
								<ItemPanel children="All Messages" type="radio" />
								<ItemPanel children="Only @mentions" type="radio" />
								<ItemPanel children="Nothing" type="radio" />
							</Dropdown>
						)}
					</GroupPanels>

					{(checkOwnerChannel || checkOwnerClan) && (
						<GroupPanels>
							<ItemPanel onClick={handleEditChannel} children="Edit Thread" />
							<ItemPanel children="Duplicate Thread" />
							{channel.type === typeChannel.text && <ItemPanel children="Create Text Thread" />}
							{channel.type === typeChannel.voice && <ItemPanel children="Create Voice Thread" />}
							<ItemPanel onClick={handleDeleteChannel} children="Delete Thread" danger />
						</GroupPanels>
					)}
				</>
			)}
		</div>
	);
};

export default PanelChannel;
