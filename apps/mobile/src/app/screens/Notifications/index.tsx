import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useChannels, useNotification } from '@mezon/core';
import { Colors } from '@mezon/mobile-ui';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import NotificationIndividualItem from './NotificationIndividualItem';
import NotificationItem from './NotificationItem';
import NotificationOption from './NotificationOption';
import { styles } from './Notifications.styles';
import { EActionDataNotify } from './types';
import { NotificationEntity } from '@mezon/store-mobile';

const Notifications = () => {
	const { notification } = useNotification();
	const { t } = useTranslation(['notification']);
	const { channels } = useChannels();

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
		handleFilterNotify(EActionDataNotify.Individual);
	}, [notification, channels]);

	const bottomSheetRef = useRef<BottomSheet>(null);

	const snapPoints = ['25%', '50%'];
	const openBottomSheet = () => {
		bottomSheetRef.current?.snapToIndex(1);
	};

	const closeBottomSheet = () => {
		bottomSheetRef.current?.close();
	};

	const renderBackdrop = useCallback((props) => <BottomSheetBackdrop {...props} opacity={0.5} onPress={closeBottomSheet} />, []);

	return (
		<View style={styles.notifications}>
			<View style={styles.notificationsHeader}>
				<Text style={styles.notificationHeaderTitle}>{t('headerTitle')}</Text>
				<Pressable onPress={() => openBottomSheet()}>
					<View style={styles.notificationHeaderIcon}>
						<Feather name="more-horizontal" size={20} color={'white'} />
					</View>
				</Pressable>
			</View>
			<View style={styles.notificationsList}>
				<FlatList
					data={sortedNotifications}
					renderItem={({ item }) => {
						return item.code === -9 ? <NotificationItem notify={item} /> : <NotificationIndividualItem notify={item} />;
					}}
					keyExtractor={(item) => item.id}
				/>
			</View>
			<BottomSheet
				ref={bottomSheetRef}
				enablePanDownToClose={true}
				backdropComponent={renderBackdrop}
				index={-1}
				snapPoints={snapPoints}
				backgroundStyle={{ backgroundColor: Colors.secondary }}
			>
				<BottomSheetView style={styles.contentContainer}>
					<NotificationOption
						channels={channels}
						onChange={(value) => {
							handleFilterNotify(value);
						}}
					/>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
};

export default Notifications;
