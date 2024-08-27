import { AngleRight } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import {
	DirectEntity,
	notificationSettingActions,
	selectCurrentChannelNotificatonSelected,
	selectCurrentClanId,
	useAppDispatch
} from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ChannelType } from 'mezon-js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import MuteChannelOption from './MuteChannelOption';
import { style } from './MuteThreadDetailModal.styles';

type RootStackParamList = {
	MuteThreadDetail: {
		currentChannel: IChannel | DirectEntity;
	};
};

type MuteThreadDetailRouteProp = RouteProp<RootStackParamList, 'MuteThreadDetail'>;

type MuteThreadDetailModalProps = {
	route: MuteThreadDetailRouteProp;
};

enum ENotificationActive {
	ON = 1,
	OFF = 0
}

const MuteThreadDetailModal = ({ route }: MuteThreadDetailModalProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['notificationSetting']);
	const navigation = useNavigation<any>();
	const [mutedUntil, setMutedUntil] = useState('');
	const { currentChannel } = route?.params || {};

	const isDMThread = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
	}, [currentChannel]);

	const isChannel = useMemo(() => {
		return currentChannel?.parrent_id !== "0";
	}, [currentChannel]);


	navigation.setOptions({
		headerShown: true,
		headerTitle: () => (
			<View>
				<Text style={{ color: themeValue.textStrong, fontSize: size.label, fontWeight: '700' }}>
					{isDMThread
						? t('notifySettingThreadModal.muteThisConversation')
						: isChannel
							? t('notifySettingThreadModal.headerTitleMuteChannel')
							: t('notifySettingThreadModal.headerTitleMuteThread')}
				</Text>
				<Text numberOfLines={1} style={{ color: themeValue.text, fontSize: size.medium, fontWeight: '400', width: '100%' }}>
					{isDMThread
						? currentChannel?.channel_label
						: isChannel
							? `#${currentChannel?.channel_label}`
							: `"${currentChannel?.channel_label}"`}
				</Text>
			</View>
		),
	});

	const getNotificationChannelSelected = useSelector(selectCurrentChannelNotificatonSelected);
	const currentClanId = useSelector(selectCurrentClanId);
	const dispatch = useAppDispatch();

	const navigateToNotificationDetail = () => {
		navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, {
			screen: APP_SCREEN.MENU_THREAD.NOTIFICATION_DETAIL_CHANNEL
		});
	};

	useEffect(() => {
		let idTimeOut;
		if (getNotificationChannelSelected?.active === ENotificationActive.ON) {
			setMutedUntil('');
		} else if (getNotificationChannelSelected?.active !== ENotificationActive.ON) {
			if (getNotificationChannelSelected?.time_mute) {
				const timeMute = new Date(getNotificationChannelSelected.time_mute);
				const currentTime = new Date();
				if (timeMute > currentTime) {
					const timeDifference = timeMute.getTime() - currentTime.getTime();
					const formattedDate = format(timeMute, 'dd/MM, HH:mm');
					setMutedUntil(`Muted until ${formattedDate}`);
					idTimeOut = setTimeout(() => {
						const body = {
							channel_id: currentChannel?.channel_id || '',
							notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
							clan_id: currentClanId || '',
							active: ENotificationActive.ON,
						};
						dispatch(notificationSettingActions.setMuteNotificationSetting(body));
						clearTimeout(idTimeOut);
					}, timeDifference);
				}
			}
		}
	}, [getNotificationChannelSelected, dispatch, currentChannel?.channel_id, currentClanId]);

	return (
		<View style={styles.wrapper}>
			<MuteChannelOption navigateBack />
			{mutedUntil ? <Text style={styles.InfoTitle}>{mutedUntil}</Text> : null}

			{!isDMThread ? (
				<Block>
					<TouchableOpacity onPress={() => navigateToNotificationDetail()} style={styles.wrapperItemNotification}>
						<Text style={styles.option}>{t('bottomSheet.title')}</Text>
						<AngleRight width={20} height={20} color={themeValue.text} />
					</TouchableOpacity>
					<Text style={styles.InfoTitle}>{t('notifySettingThreadModal.description')}</Text>
				</Block>
			) : null}
		</View>
	);
};

export default MuteThreadDetailModal;
