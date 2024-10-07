import { useEscapeKeyClose, useMarkAsRead, useOnClickOutside, usePermissionChecker } from '@mezon/core';
import {
	SetMuteNotificationPayload,
	SetNotificationPayload,
	channelsActions,
	notificationSettingActions,
	selectCategoryById,
	selectCurrentChannelId,
	selectCurrentClan,
	selectDefaultNotificationCategory,
	selectDefaultNotificationClan,
	selectSelectedChannelNotificationSetting,
	useAppDispatch
} from '@mezon/store';
import {
	ENotificationTypes,
	EOverriddenPermission,
	EPermission,
	FOR_15_MINUTES,
	FOR_1_HOUR,
	FOR_24_HOURS,
	FOR_3_HOURS,
	FOR_8_HOURS,
	IChannel
} from '@mezon/utils';
import { format } from 'date-fns';
import { Dropdown } from 'flowbite-react';
import { NotificationType } from 'mezon-js';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Coords } from '../ChannelLink';
import GroupPanels from './GroupPanels';
import ItemPanel from './ItemPanel';

type PanelChannel = {
	coords: Coords;
	channel: IChannel;
	onDeleteChannel: () => void;
	setOpenSetting: React.Dispatch<React.SetStateAction<boolean>>;
	setIsShowPanelChannel: React.Dispatch<React.SetStateAction<boolean>>;
	rootRef?: RefObject<HTMLElement>;
	isUnread?: boolean;
};

const typeChannel = {
	text: 1,
	voice: 4
};
export const notiLabels: Record<number, string> = {
	[NotificationType.ALL_MESSAGE]: 'All',
	[NotificationType.MENTION_MESSAGE]: 'Only @mention',
	[NotificationType.NOTHING_MESSAGE]: 'Nothing'
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
	}
];

const PanelChannel = ({ coords, channel, setOpenSetting, setIsShowPanelChannel, onDeleteChannel, rootRef, isUnread }: PanelChannel) => {
	const getNotificationChannelSelected = useSelector(selectSelectedChannelNotificationSetting);
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClan = useSelector(selectCurrentClan);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionTop, setPositionTop] = useState(false);
	const [nameChildren, setNameChildren] = useState('');
	const [mutedUntil, setmutedUntil] = useState('');
	const [defaultNotifiName, setDefaultNotifiName] = useState('');
	const defaultNotificationCategory = useSelector(selectDefaultNotificationCategory);
	const defaultNotificationClan = useSelector(selectDefaultNotificationClan);
	const currentCategory = useSelector(selectCategoryById(channel.category_id || ''));

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

			const body: SetNotificationPayload = {
				channel_id: channel.channel_id || '',
				notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
				clan_id: currentClan?.clan_id || '',
				time_mute: unmuteTimeISO,
				is_current_channel: channel.channel_id === currentChannelId
			};
			dispatch(notificationSettingActions.setNotificationSetting(body));
		} else {
			const body: SetMuteNotificationPayload = {
				channel_id: channel.channel_id || '',
				notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
				clan_id: currentClan?.clan_id || '',
				active: 0,
				is_current_channel: channel.channel_id === currentChannelId
			};
			dispatch(notificationSettingActions.setMuteNotificationSetting(body));
		}
	};

	const muteOrUnMuteChannel = (active: number) => {
		const body = {
			channel_id: channel.channel_id || '',
			notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
			clan_id: currentClan?.clan_id || '',
			active: active,
			is_current_channel: channel.channel_id === currentChannelId
		};
		dispatch(notificationSettingActions.setMuteNotificationSetting(body));
	};

	const setNotification = (notificationType: number | 0) => {
		if (notificationType) {
			const body = {
				channel_id: channel.channel_id || '',
				notification_type: notificationType || 0,
				clan_id: currentClan?.clan_id || '',
				is_current_channel: channel.channel_id === currentChannelId
			};
			dispatch(notificationSettingActions.setNotificationSetting(body));
		} else {
			dispatch(
				notificationSettingActions.deleteNotiChannelSetting({
					channel_id: channel.channel_id || '',
					clan_id: currentClan?.clan_id || '',
					is_current_channel: channel.channel_id === currentChannelId
				})
			);
		}
	};

	useEffect(() => {
		const heightPanel = panelRef.current?.clientHeight;
		if (heightPanel && heightPanel > coords.distanceToBottom) {
			setPositionTop(true);
		}
	}, [coords.distanceToBottom]);

	useEffect(() => {
		if (getNotificationChannelSelected?.active === 1 || getNotificationChannelSelected?.id === '0') {
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
							notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
							clan_id: currentClan?.clan_id || '',
							active: 1,
							is_current_channel: channel.channel_id === currentChannelId
						};
						dispatch(notificationSettingActions.setMuteNotificationSetting(body));
					}, timeDifference);
				}
			}
		}
		if (defaultNotificationCategory?.notification_setting_type) {
			setDefaultNotifiName(notiLabels[defaultNotificationCategory?.notification_setting_type]);
		} else if (defaultNotificationClan?.notification_setting_type) {
			setDefaultNotifiName(notiLabels[defaultNotificationClan.notification_setting_type]);
		}
	}, [getNotificationChannelSelected, defaultNotificationCategory, defaultNotificationClan]);

	const [canManageThread, canManageChannel] = usePermissionChecker(
		[EOverriddenPermission.manageThread, EPermission.manageChannel],
		channel?.channel_id ?? ''
	);

	const handClosePannel = useCallback(() => {
		setIsShowPanelChannel(false);
	}, []);

	useEscapeKeyClose(panelRef, handClosePannel);
	useOnClickOutside(panelRef, handClosePannel, rootRef);

	const handleOpenCreateChannelModal = () => {
		dispatch(channelsActions.setCurrentCategory(currentCategory));
		dispatch(channelsActions.openCreateNewModalChannel(true));
	};

	const { handleMarkAsReadChannel, statusMarkAsReadChannel } = useMarkAsRead();
	useEffect(() => {
		if (statusMarkAsReadChannel === 'success' || statusMarkAsReadChannel === 'error') {
			setIsShowPanelChannel(false);
		}
	}, [statusMarkAsReadChannel]);
	return (
		<div
			ref={panelRef}
			tabIndex={-1}
			style={{ left: coords.mouseX, bottom: positionTop ? '12px' : 'auto', top: positionTop ? 'auto' : coords.mouseY }}
			className="outline-none fixed top-full dark:bg-bgProfileBody bg-white rounded-sm shadow z-20 w-[200px] py-[10px] px-[10px]"
		>
			<GroupPanels>
				<ItemPanel
					onClick={statusMarkAsReadChannel === 'pending' ? undefined : () => handleMarkAsReadChannel(channel)}
					disabled={statusMarkAsReadChannel === 'pending'}
				>
					{statusMarkAsReadChannel === 'pending' ? 'Processing...' : 'Mark As Read'}
				</ItemPanel>
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
						{getNotificationChannelSelected?.active === 1 || getNotificationChannelSelected?.id === '0' ? (
							<Dropdown
								trigger="hover"
								dismissOnClick={false}
								renderTrigger={() => (
									<div>
										<ItemPanel children={nameChildren} dropdown="change here" onClick={() => muteOrUnMuteChannel(0)} />
									</div>
								)}
								label=""
								placement="right-start"
								className="dark:!bg-bgProfileBody bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
							>
								<ItemPanel children="For 15 Minutes" onClick={() => handleScheduleMute(FOR_15_MINUTES)} />
								<ItemPanel children="For 1 Hour" onClick={() => handleScheduleMute(FOR_1_HOUR)} />
								<ItemPanel children="For 3 Hour" onClick={() => handleScheduleMute(FOR_3_HOURS)} />
								<ItemPanel children="For 8 Hour" onClick={() => handleScheduleMute(FOR_8_HOURS)} />
								<ItemPanel children="For 24 Hour" onClick={() => handleScheduleMute(FOR_24_HOURS)} />
								<ItemPanel children="Until I turn it back on" onClick={() => handleScheduleMute(Infinity)} />
							</Dropdown>
						) : (
							<ItemPanel children={nameChildren} onClick={() => muteOrUnMuteChannel(1)} subText={mutedUntil} />
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
									checked={getNotificationChannelSelected?.notification_setting_type === ENotificationTypes.DEFAULT}
									subText={defaultNotifiName}
									onClick={() => setNotification(ENotificationTypes.DEFAULT)}
								/>
								{notificationTypesList.map((notification) => (
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

					{canManageChannel && (
						<GroupPanels>
							<ItemPanel onClick={handleEditChannel} children="Edit Channel" />
							{channel.type === typeChannel.text && <ItemPanel children="Create Text Channel" onClick={handleOpenCreateChannelModal} />}
							{channel.type === typeChannel.voice && (
								<ItemPanel children="Create Voice Channel" onClick={handleOpenCreateChannelModal} />
							)}
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

					{canManageThread && (
						<GroupPanels>
							<ItemPanel onClick={handleEditChannel} children="Edit Thread" />
							<ItemPanel children="Create Thread" />
							<ItemPanel onClick={handleDeleteChannel} children="Delete Thread" danger />
						</GroupPanels>
					)}
				</>
			)}
		</div>
	);
};

export default PanelChannel;
