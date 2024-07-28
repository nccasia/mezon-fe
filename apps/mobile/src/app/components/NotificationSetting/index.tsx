import { useTheme } from '@mezon/mobile-ui';
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
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { MezonRadioButton } from '../../temp-ui';
import FilterCheckbox from './FilterCheckbox/FilterCheckbox';
import { style } from './NotificationSetting.styles';

export const enum ENotificationType {
	CATEGORY_DEFAULT = 'Use Category Default',
	ALL_MESSAGE = 'ALL',
	NOTHING_MESSAGE = 'NOTHING',
	MENTION_MESSAGE = 'MENTION',
}

export default function NotificationSetting() {
	const { themeValue } = useTheme();
	const { t } = useTranslation(['notificationSetting']);
	const styles = style(themeValue);
	const optionNotifySetting = [
		{
			id: 0,
			label: t('bottomSheet.labelOptions.categoryDefault'),
			isChecked: false,
			value: undefined,
		},
		{
			id: 1,
			label: t('bottomSheet.labelOptions.allMessage'),
			isChecked: false,
			value: ENotificationType.ALL_MESSAGE,
		},
    {
			id: 2,
			label: t('bottomSheet.labelOptions.mentionMessage'),
			isChecked: false,
			value: ENotificationType.MENTION_MESSAGE,
		},
		{
			id: 3,
			label: t('bottomSheet.labelOptions.notThingMessage'),
			isChecked: false,
			value: ENotificationType.NOTHING_MESSAGE,
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
		if (notifyOptionSelected?.length) {
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
					<MezonRadioButton checked={isChecked} />
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
