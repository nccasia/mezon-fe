import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNotification } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { channelsActions, getStoreAsync, selectCurrentClanId } from '@mezon/store-mobile';
import { INotification, NotificationCode, NotificationEntity } from '@mezon/utils';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { MezonBottomSheet } from '../../temp-ui';
import EmptyNotification from './EmptyNotification';
import NotificationItem from './NotificationItem';
import NotificationItemOption from './NotificationItemOption';
import NotificationOption from './NotificationOption';
import { style } from './Notifications.styles';
import { EActionDataNotify, ENotifyBsToShow } from './types';

const Notifications = () => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { notification, deleteNotify } = useNotification();
	const [notify, setNotify] = useState<INotification>();
	const currentClanId = useSelector(selectCurrentClanId);

	const { t } = useTranslation(['notification']);
	const navigation = useNavigation();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const bottomSheetOptionsRef = useRef<BottomSheetModal>(null);

	const [selectedTabs, setSelectedTabs] = useState({ individual: true, mention: true });
	const [notificationsFilter, setNotificationsFilter] = useState<NotificationEntity[]>([]);

	useEffect(() => {
		handleFilterNotify(EActionDataNotify.All);
	}, [notification]);

	const handleFilterNotify = (tabNotify) => {
		const sortNotifications = notification.sort((a, b) => {
			const dateA = new Date(a.create_time || '').getTime();
			const dateB = new Date(b.create_time || '').getTime();
			return dateB - dateA;
		});

		switch (tabNotify) {
			case EActionDataNotify.Individual:
				setNotificationsFilter(
					sortNotifications.filter((item) => item.code !== NotificationCode.USER_MENTIONED && item.code !== NotificationCode.USER_REPLIED),
				);
				break;
			case EActionDataNotify.Mention:
				setNotificationsFilter(
					sortNotifications.filter((item) => item.code === NotificationCode.USER_MENTIONED || item.code === NotificationCode.USER_REPLIED),
				);
				break;
			case EActionDataNotify.All:
				setNotificationsFilter(sortNotifications);
				break;
			default:
				setNotificationsFilter([]);
				break;
		}
	};

	const handleTabChange = (value, isSelected) => {
		setSelectedTabs((prevState) => ({
			...prevState,
			[value]: isSelected,
		}));
	};

	useEffect(() => {
		setSelectedTabs({ individual: true, mention: true });
	}, [currentClanId]);

	useEffect(() => {
		const { individual, mention } = selectedTabs;
		handleFilterNotify(
			individual && mention ? EActionDataNotify.All : individual ? EActionDataNotify.Individual : mention ? EActionDataNotify.Mention : null,
		);
	}, [selectedTabs.individual, selectedTabs.mention]);

	const openBottomSheet = (type: ENotifyBsToShow, notify?: INotification) => {
		switch (type) {
			case ENotifyBsToShow.notification:
				bottomSheetRef.current?.present();
				break;
			case ENotifyBsToShow.removeNotification:
				bottomSheetOptionsRef.current?.present();
				setNotify(notify);
				break;
			default:
				bottomSheetRef.current?.present();
				break;
		}
	};

	const handleDeleteNotify = (notify?: INotification) => {
		notify && deleteNotify(notify.id, currentClanId || '0');
		closeBottomSheet();
	};

	const handleOnPressNotify = async (notify: INotification) => {
		const store = await getStoreAsync();
		navigation.navigate(APP_SCREEN.HOME as never);

		// store.dispatch(messagesActions.jumpToMessage({ messageId: notify.content.message_id, channelId: notify.content.channel_id }));
		store.dispatch(
			channelsActions.joinChannel({
				clanId: notify?.content?.clan_id ?? '',
				channelId: notify?.content?.channel_id,
				noFetchMembers: false,
			}),
		);
		navigation.dispatch(DrawerActions.closeDrawer());
	};

	const closeBottomSheet = () => {
		bottomSheetRef.current?.dismiss();
		bottomSheetOptionsRef.current?.dismiss();
	};

	return (
		<View style={styles.notifications}>
			<View style={styles.notificationsHeader}>
				<Text style={styles.notificationHeaderTitle}>{t('headerTitle')}</Text>
				<Pressable onPress={() => openBottomSheet(ENotifyBsToShow.notification)}>
					<View style={styles.notificationHeaderIcon}>
						<Icons.MoreHorizontalIcon height={20} width={20} color={themeValue.textStrong} />
					</View>
				</Pressable>
			</View>

			<View style={styles.notificationsList}>
				{notificationsFilter?.length > 0 ? (
					<FlatList
						data={notificationsFilter}
						renderItem={({ item }) => {
							return (
								<NotificationItem
									notify={item}
									onLongPressNotify={openBottomSheet}
									onPressNotify={handleOnPressNotify}
								></NotificationItem>
							);
						}}
						keyExtractor={(item) => item.id}
					/>
				) : (
					<EmptyNotification />
				)}
			</View>

			<MezonBottomSheet ref={bottomSheetRef} heightFitContent title={t('headerTitle')} titleSize="md">
				<NotificationOption onChangeTab={handleTabChange} selectedTabs={selectedTabs} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetOptionsRef} heightFitContent>
				<NotificationItemOption onDelete={() => handleDeleteNotify(notify)} />
			</MezonBottomSheet>
		</View>
	);
};

export default Notifications;
