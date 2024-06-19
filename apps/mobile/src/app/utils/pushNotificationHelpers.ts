import { STORAGE_KEY_CLAN_CURRENT_CACHE, getUpdateOrAddClanChannelCache, save } from '@mezon/mobile-components';
import { appActions, channelsActions, clansActions, getStoreAsync, messagesActions } from '@mezon/store-mobile';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { Alert, Linking, Platform } from 'react-native';
import { clanAndChannelIdLinkRegex, clanDirectMessageLinkRegex } from './helpers';
const IS_ANDROID = Platform.OS === 'android';

export const checkNotificationPermission = async () => {
	const authorizationStatus = await messaging().hasPermission();

	if (authorizationStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
		// Permission has not been requested yet
		await requestNotificationPermission();
	} else if (authorizationStatus === messaging.AuthorizationStatus.DENIED) {
		// Permission has been denied
		Alert.alert('Notification Permission', 'Notifications are disabled. Please enable them in settings.', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'OK',
				onPress: () => {
					openAppSettings();
				},
			},
		]);
	} else if (
		authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
		authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
	) {
		// Permission is granted
		console.log('Notification permission granted.');
	}
};

const requestNotificationPermission = async () => {
	try {
		await messaging().requestPermission();
		// Alert.alert('Notification Permission', 'Notifications have been enabled.');
	} catch (error) {
		Alert.alert('Notification Permission', 'Notification permission denied.', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'OK',
				onPress: () => {
					openAppSettings();
				},
			},
		]);
	}
};

const openAppSettings = () => {
	if (Platform.OS === 'ios') {
		Linking.openURL('app-settings:');
	} else {
		Linking.openSettings();
	}
};
export const createLocalNotification = async (title: string, body: string, data: { [key: string]: string | object }) => {
	try {
		const channelId = await notifee.createChannel({
			id: 'default',
			name: 'mezon',
		});
		await notifee.displayNotification({
			title: title || '',
			body: body,
			data: data,
			android: {
				channelId: 'mezon-mobile',
				smallIcon: 'ic_notification',
				color: '#000000',
				pressAction: {
					id: 'default',
				},
			},
			ios: {
				critical: true,
				criticalVolume: 0.5,
				foregroundPresentationOptions: {
					badge: true,
					banner: true,
					list: true,
					sound: true,
				},
			},
		});
	} catch (err) {
		console.log('Tom log  => err', err);
	}
};

export const handleFCMToken = async () => {
	const authStatus = await messaging().requestPermission();

	const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || messaging.AuthorizationStatus.PROVISIONAL;

	if (enabled) {
		const fcmtoken = await messaging().getToken();
		if (fcmtoken) {
			try {
				return fcmtoken;
			} catch (error) {
				console.log('Error setting fcmtoken to user');
			}
		}
	}
};

export const navigateToNotification = async (notification: any, navigation: any, currentClan: any) => {
	const link = notification?.data?.link;
	if (link) {
		const store = await getStoreAsync();
		store.dispatch(appActions.setLoadingMainMobile(true));
		store.dispatch(appActions.setIsFromFCMMobile(true));

		const linkMatch = link.match(clanAndChannelIdLinkRegex);

		// IF is notification to channel
		if (linkMatch) {
			store.dispatch(appActions.setLoadingMainMobile(true));
			const clanId = linkMatch[1];
			const isDifferentClan = currentClan?.clan_id !== clanId;
			const channelId = linkMatch[2];
			if (isDifferentClan) store.dispatch(clansActions.changeCurrentClan({ clanId: clanId }));
			setTimeout(
				() => {
					const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
					save(STORAGE_KEY_CLAN_CURRENT_CACHE, dataSave);
					store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: channelId }));
					store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
					store.dispatch(appActions.setLoadingMainMobile(false));
					store.dispatch(appActions.setIsFromFCMMobile(false));
				},
				isDifferentClan ? 2500 : 0,
			);
		} else {
			const linkDirectMessageMatch = link.match(clanDirectMessageLinkRegex);

			// IS message DM
			if (linkDirectMessageMatch) {
				const messageId = linkDirectMessageMatch[1];
				const type = linkDirectMessageMatch[2];

				store.dispatch(appActions.setLoadingMainMobile(false));
				store.dispatch(appActions.setIsFromFCMMobile(false));
				// TODO: handle navigation
			}
		}

		// TODO: handle navigation
		// handleRemoteNotificationNavigation(notification.data.action, notification);
	}
};

const processNotification = ({ notification, navigation, currentClan, time = 0 }) => {
	if (time) {
		setTimeout(() => {
			navigateToNotification(notification, navigation, currentClan);
		}, time);
	} else {
		navigateToNotification(notification, navigation, currentClan);
	}
};

export const setupNotificationListeners = async (navigation, currentClan) => {
	await notifee.createChannel({
		id: 'default',
		name: 'mezon',
		importance: AndroidImportance.HIGH,
	});

	if (IS_ANDROID) {
		messaging()
			.getInitialNotification()
			.then(async (remoteMessage) => {
				console.log('Notification caused app to open from quit state:');

				if (remoteMessage?.notification?.title) {
					processNotification({
						notification: { ...remoteMessage?.notification, data: remoteMessage?.data },
						navigation,
						currentClan,
						time: 2500,
					});
				}
			});
	}

	messaging().onNotificationOpenedApp((remoteMessage) => {
		console.log('Notification caused app to open from background state:');
		processNotification({
			notification: { ...remoteMessage?.notification, data: remoteMessage?.data },
			navigation,
			currentClan,
			time: 0,
		});
	});

	return notifee.onForegroundEvent(({ type, detail }) => {
		switch (type) {
			case EventType.DISMISSED:
				console.log('User dismissed notification', detail.notification);

				break;
			case EventType.PRESS:
				processNotification({
					notification: detail.notification,
					navigation,
					currentClan,
				});
				console.log('User pressed notification', detail.notification);

				break;
		}
	});
};
