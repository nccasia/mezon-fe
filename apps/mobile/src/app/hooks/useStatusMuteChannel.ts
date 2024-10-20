import { ENotificationActive, ENotificationChannelId } from '@mezon/mobile-components';
import { selectCurrentChannelNotificatonSelected, selectDefaultNotificationCategory, selectDefaultNotificationClan } from '@mezon/store-mobile';
import { NotificationType } from 'mezon-js';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useStatusMuteChannel = () => {
	const [statusMute, setStatusMute] = useState<ENotificationActive>(ENotificationActive.ON);
	const defaultNotificationCategory = useSelector(selectDefaultNotificationCategory);
	const getNotificationChannelSelected = useSelector(selectCurrentChannelNotificatonSelected);
	const defaultNotificationClan = useSelector(selectDefaultNotificationClan);
	useEffect(() => {
		if (
			getNotificationChannelSelected?.active === ENotificationActive.ON &&
			getNotificationChannelSelected?.notification_setting_type === NotificationType.NOTHING_MESSAGE
		) {
			setStatusMute(ENotificationActive.OFF);
		} else if (
			getNotificationChannelSelected?.id !== ENotificationChannelId.Default &&
			getNotificationChannelSelected?.active !== ENotificationActive.ON
		) {
			setStatusMute(ENotificationActive.OFF);
		} else if (getNotificationChannelSelected?.id === ENotificationChannelId.Default) {
			if (defaultNotificationCategory?.notification_setting_type === NotificationType.NOTHING_MESSAGE) {
				setStatusMute(ENotificationActive.OFF);
			} else if (defaultNotificationClan?.notification_setting_type === NotificationType.NOTHING_MESSAGE) {
				setStatusMute(ENotificationActive.OFF);
			} else {
				setStatusMute(ENotificationActive.ON);
			}
		} else {
			setStatusMute(ENotificationActive.ON);
		}
	}, [getNotificationChannelSelected, defaultNotificationCategory, defaultNotificationClan]);
	return {
		statusMute
	};
};

export default useStatusMuteChannel;
