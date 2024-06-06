import { Colors } from '@mezon/mobile-ui';
import {
	notifiReactMessageActions,
	notificationSettingActions,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectDefaultNotificationCategory,
	selectDefaultNotificationClan,
	selectNotifiReactMessage,
	selectnotificatonSelected,
	useAppDispatch,
} from '@mezon/store-mobile';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox/build/dist/BouncyCheckbox';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import FilterCheckbox from './FilterCheckbox/FilterCheckbox';
import { styles } from './NotificationSetting.styles';

export const enum ENotificationType {
	CATEGORY_DEFAULT = 'Use Category Default',
	ALL_MESSAGE = 'ALL',
	NOTHING_MESSAGE = 'NOTHING',
	MENTION_MESSAGE = 'MENTION',
}

export default function NotificationSetting() {
	const optionNotifySetting = [
		{
			id: 0,
			label: ENotificationType.CATEGORY_DEFAULT,
			isChecked: false,
			value: undefined,
		},
		{
			id: 1,
			label: ENotificationType.ALL_MESSAGE,
			isChecked: false,
			value: ENotificationType.ALL_MESSAGE,
		},
		{
			id: 2,
			label: ENotificationType.NOTHING_MESSAGE,
			isChecked: false,
			value: ENotificationType.NOTHING_MESSAGE,
		},
		{
			id: 3,
			label: ENotificationType.MENTION_MESSAGE,
			isChecked: false,
			value: ENotificationType.MENTION_MESSAGE,
		},
	];
	const [radioBox, setRadioBox] = useState(optionNotifySetting);
	const [isChecked, setIsChecked] = useState<boolean>(false);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);
	const notifyReactMessage = useSelector(selectNotifiReactMessage);
	const getNotificationChannelSelected = useSelector(selectnotificatonSelected);
	const defaultNotificationCategory = useSelector(selectDefaultNotificationCategory);
	const defaultNotificationClan = useSelector(selectDefaultNotificationClan);
	const [defaultNotifyName, setDefaultNotifyName] = useState('');
	const dispatch = useAppDispatch();
	const { t } = useTranslation(['notificationSetting']);

	useEffect(() => {
		setIsChecked(notifyReactMessage?.id !== '0');
		setRadioBox(radioBox.map((item) => item && { ...item, isChecked: getNotificationChannelSelected?.notification_setting_type === item.value }));
	}, [notifyReactMessage, getNotificationChannelSelected]);

	useEffect(() => {
		if (defaultNotificationCategory?.notification_setting_type) {
			setDefaultNotifyName(defaultNotificationCategory.notification_setting_type);
		} else if (defaultNotificationClan?.notification_setting_type) {
			setDefaultNotifyName(defaultNotificationClan.notification_setting_type);
		}
	}, [getNotificationChannelSelected, defaultNotificationCategory, defaultNotificationClan]);

	const handleRadioBoxPress = (checked: boolean, id: number) => {
		const notifyOptionSelected = radioBox.map((item) => item && { ...item, isChecked: item.id === id });
		setRadioBox(notifyOptionSelected);
		if (notifyOptionSelected.length) {
			const notifyOptionSettingSelected = notifyOptionSelected.find((option) => option.isChecked);
			if (
				[ENotificationType.ALL_MESSAGE, ENotificationType.MENTION_MESSAGE, ENotificationType.NOTHING_MESSAGE].includes(
					notifyOptionSettingSelected?.value,
				)
			) {
				const body = {
					channel_id: currentChannelId || '',
					notification_type: notifyOptionSettingSelected?.value || '',
					clan_id: currentClanId || '',
				};
				dispatch(notificationSettingActions.setNotificationSetting(body));
			} else {
				dispatch(notificationSettingActions.deleteNotiChannelSetting({ channel_id: currentChannelId || '', clan_id: currentClanId || '' }));
			}
		}
	};
	const handleCheckboxPress = () => {
		setIsChecked(!isChecked);
		if (!isChecked) {
			dispatch(notifiReactMessageActions.setNotifiReactMessage({ channel_id: currentChannelId || '' }));
		} else {
			dispatch(notifiReactMessageActions.deleteNotifiReactMessage({ channel_id: currentChannelId || '' }));
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.headerTitle}>{t('bottomSheet.title')}</Text>
			<View style={styles.optionsSetting}>
				<TouchableOpacity onPress={handleCheckboxPress} style={styles.option}>
					<Text style={styles.labelOption}>{t('bottomSheet.labelOptions.reactionMessage')}</Text>
					<BouncyCheckbox
						isChecked={isChecked}
						size={20}
						fillColor={Colors.bgButton}
						iconStyle={{ borderRadius: 5 }}
						innerIconStyle={{ borderWidth: 1.5, borderColor: isChecked ? Colors.bgButton : Colors.white, borderRadius: 5 }}
						textStyle={{ fontFamily: 'JosefinSans-Regular' }}
					/>
				</TouchableOpacity>
				{radioBox.map((item) => (
					<FilterCheckbox
						id={item.id}
						label={item.label}
						key={`${item.id}`}
						isChecked={item.isChecked}
						defaultNotifyName={defaultNotifyName}
						onCheckboxPress={handleRadioBoxPress}
					/>
				))}
			</View>
		</View>
	);
}
