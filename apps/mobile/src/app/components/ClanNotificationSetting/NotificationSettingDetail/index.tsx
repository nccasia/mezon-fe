import { EOptionOverridesType, optionNotification } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { defaultNotificationCategoryActions, notificationSettingActions, selectCurrentClanId, useAppDispatch } from '@mezon/store-mobile';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonOption } from '../../../temp-ui';
import MuteClanNotificationBS from '../MuteClanNotificationBS';
import { style } from './NotificationSettingDetail.styles';

const NotificationSettingDetail = ({ route }: { route: any }) => {
	const { notifyChannelCategorySetting } = route.params || {};
	const currentClanId = useSelector(selectCurrentClanId);
	const { t } = useTranslation(['clanNotificationsSetting']);
	const [selectedOption, setSelectedOption] = useState(null);
	const { themeValue } = useTheme();
	const dispatch = useAppDispatch();
	const styles = style(themeValue);
	const title = useMemo(() => {
		return notifyChannelCategorySetting?.channel_category_title || notifyChannelCategorySetting?.title;
	}, [notifyChannelCategorySetting]);

	useEffect(() => {
		setSelectedOption(notifyChannelCategorySetting?.notification_setting_type);
	}, [notifyChannelCategorySetting?.notification_setting_type]);

	const handleNotificationChange = (value) => {
		setSelectedOption(value);
		if (title === 'category') {
			dispatch(
				defaultNotificationCategoryActions.setDefaultNotificationCategory({
					category_id: notifyChannelCategorySetting?.id,
					notification_type: value,
					clan_id: currentClanId || '',
				}),
			);
		}
		if (title === 'channel') {
			dispatch(
				notificationSettingActions.setNotificationSetting({
					channel_id: notifyChannelCategorySetting?.id,
					notification_type: value,
					clan_id: currentClanId || '',
				}),
			);
		}
	};

	const handleRemoveOverride = () => {
		setSelectedOption(0);
		if (title === 'category') {
			dispatch(
				defaultNotificationCategoryActions.deleteDefaultNotificationCategory({
					category_id: notifyChannelCategorySetting?.id,
					clan_id: currentClanId,
				}),
			);
		}
		if (title === 'channel') {
			dispatch(
				notificationSettingActions.deleteNotiChannelSetting({ channel_id: notifyChannelCategorySetting?.id, clan_id: currentClanId || '' }),
			);
		}
	};

	return (
		<Block backgroundColor={themeValue.primary} flex={1} padding={size.s_10}>
			{notifyChannelCategorySetting?.type !== EOptionOverridesType.Category && (
				<Block>
					<MuteClanNotificationBS
						currentChannel={notifyChannelCategorySetting}
						description={t('clanNotificationSettingDetail.muteChannelSubText')}
					/>
					{/* <Text style={styles.description}>
						{t('clanNotificationSettingDetail.youHaveMuted')}
						<Text style={styles.duration}> 8/8, 2:28 pm </Text>
					</Text> */}
				</Block>
			)}
			<MezonOption onChange={handleNotificationChange} value={selectedOption} title={'Clan Notifications Setting'} data={optionNotification} />
			{!!selectedOption && (
				<TouchableOpacity
					onPress={() => {
						handleRemoveOverride();
					}}
					style={styles.resetOverridesBtn}
				>
					<Text style={styles.textBtn}>{t('resetOverrides')}</Text>
				</TouchableOpacity>
			)}
		</Block>
	);
};

export default NotificationSettingDetail;
