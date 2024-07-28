import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AngleRight, ArrowLeftIcon, Icons } from '@mezon/mobile-components';
import { Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { DirectEntity, notificationSettingActions, selectCurrentClanId, selectnotificatonSelected, useAppDispatch } from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ChannelType } from 'mezon-js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { IMezonMenuSectionProps, MezonBottomSheet, MezonMenu } from '../../temp-ui';
import NotificationSetting from '../NotificationSetting';
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

const MuteThreadDetailModal = ({ route }: MuteThreadDetailModalProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['notificationSetting']);
	const menu = useMemo(
		() =>
			[
				{
					items: [
						{
							title: t('notifySettingThreadModal.muteDuration.forFifteenMinutes'),
							onPress: () => {
								handleScheduleMute(15 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.forOneHour'),
							onPress: () => {
								handleScheduleMute(60 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.forThreeHours'),
							onPress: () => {
								handleScheduleMute(3 * 60 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.forEightHours'),
							onPress: () => {
								handleScheduleMute(8 * 60 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.forTwentyFourHours'),
							onPress: () => {
								handleScheduleMute(24 * 60 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.untilTurnItBackOn'),
							onPress: () => {
								handleScheduleMute(Infinity);
							},
						},
					],
				},
			] as IMezonMenuSectionProps[],
		[],
	);

	const navigation = useNavigation<any>();
	const [mutedUntil, setMutedUntil] = useState('');
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const [isChannel, setIsChannel] = useState<boolean>();
	const { currentChannel } = route?.params || {};
	const isDMThread = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
	}, [currentChannel]);

	useEffect(() => {
		setIsChannel(!!currentChannel?.channel_label && !Number(currentChannel?.parrent_id));
	}, [currentChannel]);

	navigation.setOptions({
		headerShown: true,
		headerTintColor: Colors.white,
		headerLeft: () => (
			<Pressable style={{ marginLeft: size.s_10 }} onPress={() => navigateToThreadDetail()}>
				<ArrowLeftIcon />
			</Pressable>
		),
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

	const getNotificationChannelSelected = useSelector(selectnotificatonSelected);
	const currentClanId = useSelector(selectCurrentClanId);
	const dispatch = useAppDispatch();

	const openBottomSheet = () => {
		bottomSheetRef.current?.present();
	};

	useEffect(() => {
		let idTimeOut;
		if (getNotificationChannelSelected?.active === 1) {
			setMutedUntil('');
		} else if (getNotificationChannelSelected?.active !== 1) {
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
							notification_type: getNotificationChannelSelected?.notification_setting_type || '',
							clan_id: currentClanId || '',
							active: 1,
						};
						dispatch(notificationSettingActions.setMuteNotificationSetting(body));
						clearTimeout(idTimeOut);
					}, timeDifference);
				}
			}
		}
	}, [getNotificationChannelSelected, dispatch, currentChannel?.channel_id, currentClanId]);

	const muteOrUnMuteChannel = (active: number) => {
		const body = {
			channel_id: currentChannel?.channel_id || '',
			notification_type: getNotificationChannelSelected?.notification_setting_type || '',
			clan_id: currentClanId || '',
			active: active,
		};
		dispatch(notificationSettingActions.setMuteNotificationSetting(body));
		navigateToThreadDetail();
	};

	const navigateToThreadDetail = () => {
		navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET, params: { directMessage: currentChannel } });
	};

	const handleScheduleMute = (duration: number) => {
		if (duration !== Infinity) {
			const now = new Date();
			const unmuteTime = new Date(now.getTime() + duration);
			const unmuteTimeISO = unmuteTime.toISOString();

			const body = {
				channel_id: currentChannel?.channel_id || '',
				notification_type: getNotificationChannelSelected?.notification_setting_type || '',
				clan_id: currentClanId || '',
				time_mute: unmuteTimeISO,
			};
			dispatch(notificationSettingActions.setNotificationSetting(body));
		} else {
			const body = {
				channel_id: currentChannel?.channel_id || '',
				notification_type: getNotificationChannelSelected?.notification_setting_type || '',
				clan_id: currentClanId || '',
				active: 0,
			};
			dispatch(notificationSettingActions.setMuteNotificationSetting(body));
		}
		navigateToThreadDetail();
	};

	return (
		<View style={styles.wrapper}>
			{getNotificationChannelSelected?.active === 1 ? (
				<MezonMenu menu={menu} />
			) : (
				<View style={styles.optionsBox}>
					<TouchableOpacity
						onPress={() => {
							muteOrUnMuteChannel(1);
						}}
						style={styles.wrapperUnmuteBox}
					>
						<Icons.BellSlashIcon width={20} height={20} style={{ marginRight: 20 }} color={themeValue.text} />
						<Text
							style={styles.option}
						>{`Unmute ${isDMThread ? currentChannel?.channel_label : isChannel ? `#${currentChannel?.channel_label}` : `"${currentChannel?.channel_label}"`} `}</Text>
					</TouchableOpacity>
				</View>
			)}
			{mutedUntil ? <Text style={styles.InfoTitle}>{mutedUntil}</Text> : null}
			{!isDMThread ? (
				<Block>
					<TouchableOpacity onPress={() => openBottomSheet()} style={styles.wrapperItemNotification}>
						<Text style={styles.option}>{t('bottomSheet.title')}</Text>
						<AngleRight width={20} height={20} color={themeValue.text} />
					</TouchableOpacity>
					<Text style={styles.InfoTitle}>{t('notifySettingThreadModal.description')}</Text>
				</Block>
			) : null}

			<MezonBottomSheet heightFitContent ref={bottomSheetRef}>
				<NotificationSetting />
			</MezonBottomSheet>
		</View>
	);
};

export default MuteThreadDetailModal;
