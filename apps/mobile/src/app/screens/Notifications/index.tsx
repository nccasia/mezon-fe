import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useChannels, useNotification } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { INotification, NotificationEntity, channelsActions, getStoreAsync } from '@mezon/store-mobile';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { MezonBottomSheet } from '../../temp-ui';
import NotificationIndividualItem from './NotificationIndividualItem';
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

	const { t } = useTranslation(['notification']);
	const { channels } = useChannels();
	const navigation = useNavigation();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const bottomSheetOptionsRef = useRef<BottomSheetModal>(null);

	const [sortedNotifications, setSortedNotifications] = useState<NotificationEntity[]>([]);

	const handleFilterNotify = (tabNotify) => {
		const dataSort = notification.sort((a, b) => moment(b.create_time).valueOf() - moment(a.create_time).valueOf());

		switch (tabNotify) {
			case EActionDataNotify.Individual:
				setSortedNotifications(
					dataSort.filter((item) => item.code !== -9 && channels.some((channel) => channel.channel_id === item.content.channel_id)),
				);
				break;
			case EActionDataNotify.Mention:
				setSortedNotifications(
					dataSort.filter((item) => item.code === -9 && channels.some((channel) => channel.channel_id === item.content.channel_id)),
				);
				break;
			case EActionDataNotify.All:
				setSortedNotifications(dataSort.filter((item) => channels.some((channel) => channel.channel_id === item.content.channel_id)));
				break;
			default:
				setSortedNotifications([]);
				break;
		}
	};

	useEffect(() => {
		handleFilterNotify(EActionDataNotify.All);
	}, [notification, channels]);

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
		notify && deleteNotify(notify.id);
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
				<FlatList
					data={sortedNotifications}
					renderItem={({ item }) => {
						return item.code === -9 ? (
							<NotificationItem onPressNotify={handleOnPressNotify} notify={item} onLongPressNotify={openBottomSheet} />
						) : (
							<NotificationIndividualItem onPressNotify={handleOnPressNotify} notify={item} onLongPressNotify={openBottomSheet} />
						);
					}}
					keyExtractor={(item) => item.id}
				/>
			</View>

			<MezonBottomSheet ref={bottomSheetRef} heightFitContent title={t('headerTitle')} titleSize="md">
				<NotificationOption
					channels={channels}
					onChange={(value) => {
						handleFilterNotify(value);
					}}
				/>
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetOptionsRef} heightFitContent>
				<NotificationItemOption onDelete={() => handleDeleteNotify(notify)} />
			</MezonBottomSheet>
		</View>
	);
};

export default Notifications;
