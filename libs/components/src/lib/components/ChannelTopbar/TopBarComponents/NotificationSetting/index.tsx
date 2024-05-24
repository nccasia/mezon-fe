import { selectDefaultNotificationCategory, selectDefaultNotificationClan, selectnotificatonSelected } from '@mezon/store';
import { Dropdown } from 'flowbite-react';
import { NotificationType } from 'mezon-js';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ItemNotificationSetting from './ItemNotificationSetting';

const NotificationSetting = () => {
	const getNotificationChannelSelected = useSelector(selectnotificatonSelected);
	const defaultNotificationCategory = useSelector(selectDefaultNotificationCategory);
	const defaultNotificationClan = useSelector(selectDefaultNotificationClan);
	const [defaultNotifiName, setDefaultNotifiName] = useState('');
	const notificationTypes = Object.values(NotificationType);
	useEffect(() => {
		if (getNotificationChannelSelected?.notification_setting_type) {
			setDefaultNotifiName(getNotificationChannelSelected.notification_setting_type);
		} else if (defaultNotificationCategory?.notification_setting_type) {
			setDefaultNotifiName(defaultNotificationCategory.notification_setting_type);
		} else if (defaultNotificationClan?.notification_setting_type) {
			setDefaultNotifiName(defaultNotificationClan.notification_setting_type);
		}
	}, [getNotificationChannelSelected, defaultNotificationCategory, defaultNotificationClan]);

	//TODO
	const handleScheduleMute = (duration: number) => {
		const now = new Date();
		const unmuteTime = new Date(now.getTime() + duration);
		const unmuteTimeISO = unmuteTime.toISOString();
		setTimeout(() => {
			console.log('Unmute notifications');
		}, duration);
		// const formattedDate = format(unmuteTime, 'dd/MM/yyyy, HH:mm');
	};

	return (
		<div className="absolute top-8 right-0 shadow z-[99999999]">
			<div className="flex flex-col rounded-[4px] w-[202px] shadow-sm overflow-hidden py-[6px] px-[8px] dark:bg-black bg-white">
				<div className="flex flex-col pb-1 mb-1 border-b-[0.08px] dark:border-b-[#6A6A6A] border-b-[#E1E1E1] last:border-b-0 last:mb-0 last:pb-0">
					<Dropdown
						trigger="hover"
						dismissOnClick={false}
						renderTrigger={() => (
							<div>
								<ItemNotificationSetting children="Mute Channel" dropdown="change here" />
							</div>
						)}
						label=""
						placement="right-start"
						className="dark:bg-black bg-white border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
					>
						<ItemNotificationSetting children="For 15 Minutes" onClick={() => handleScheduleMute(15 * 10 * 1000)} />
						<ItemNotificationSetting children="For 1 Hour" onClick={() => handleScheduleMute(60 * 60 * 1000)} />
						<ItemNotificationSetting children="For 3 Hours" onClick={() => handleScheduleMute(3 * 60 * 60 * 1000)} />
						<ItemNotificationSetting children="For 8 Hours" onClick={() => handleScheduleMute(8 * 60 * 60 * 1000)} />
						<ItemNotificationSetting children="For 24 Hours" onClick={() => handleScheduleMute(24 * 60 * 60 * 1000)} />
						<ItemNotificationSetting children="Until I turn it back on" onClick={() => handleScheduleMute(Infinity)} />
					</Dropdown>
				</div>
				<ItemNotificationSetting
					children="Use Category Default"
					type="radio"
					name="NotificationSetting"
					defaultNotifi={true}
					defaultNotifiName={defaultNotifiName}
					notifiSelected={getNotificationChannelSelected?.notification_setting_type === undefined}
				/>
				{notificationTypes.map((notification) => (
					<ItemNotificationSetting
						children={notification}
						notificationId={notification}
						type="radio"
						name="NotificationSetting"
						key={notification}
						notifiSelected={getNotificationChannelSelected?.notification_setting_type === notification}
					/>
				))}
			</div>
		</div>
	);
};

export default NotificationSetting;
