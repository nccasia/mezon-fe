import {
	ActionEmitEvent,
	STORAGE_CLAN_ID,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	STORAGE_IS_DISABLE_LOAD_BACKGROUND,
	getUpdateOrAddClanChannelCache,
	save,
	setDefaultChannelLoader
} from '@mezon/mobile-components';
import { appActions, channelsActions, clansActions, getStoreAsync } from '@mezon/store-mobile';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { AndroidVisibility } from '@notifee/react-native/src/types/NotificationAndroid';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { delay } from 'lodash';
import { Alert, DeviceEventEmitter, Linking, Platform } from 'react-native';
import { APP_SCREEN } from '../navigation/ScreenTypes';
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
				visibility: AndroidVisibility.PUBLIC,
				channelId: 'mezon-mobile',
				smallIcon: 'ic_notification',
				color: '#000000',
				sound: 'hollow',
				pressAction: {
					id: 'default',
				},
			},
			ios: {
				critical: true,
				criticalVolume: 0.9,
				sound: 'hollow.wav',
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

export const isShowNotification = (currentChannelId, currentDmId, remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
	if (!remoteMessage?.notification?.title) {
		return false;
	}

	const link = remoteMessage?.data?.link as string;
	const directMessageId = link.match(clanDirectMessageLinkRegex)?.[1] || '';
	const channelMessageId = link.match(clanAndChannelIdLinkRegex)?.[2] || '';

	const areOnChannel = currentChannelId === channelMessageId;
	const areOnDirectMessage = currentDmId === directMessageId;

	if (areOnChannel && currentDmId) {
		return true;
	}

	if ((channelMessageId && areOnChannel) || (directMessageId && areOnDirectMessage)) {
		return false;
	}

	return true;
};

const jumpChannelOnNotification = async (store: any, channelId: string, clanId: string) => {
	store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
	store.dispatch(appActions.setLoadingMainMobile(false));
};

export const navigateToNotification = async (store: any, notification: any, navigation: any) => {
	const link = notification?.data?.link;
	if (link) {
		const linkMatch = link.match(clanAndChannelIdLinkRegex);

		// IF is notification to channel
		if (linkMatch) {
			if (navigation) {
				navigation.navigate(APP_SCREEN.HOME as never);
				DeviceEventEmitter.emit(ActionEmitEvent.HOME_DRAWER, { isShowDrawer: false });
			}
			const clanId = linkMatch[1];
			const channelId = linkMatch[2];
			const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
			save(STORAGE_CLAN_ID, clanId);
			store.dispatch(clansActions.joinClan({ clanId: clanId }));
			store.dispatch(clansActions.changeCurrentClan({ clanId: clanId, noCache: true }));
			const respChannel = await store.dispatch(channelsActions.fetchChannels({ clanId: clanId, noCache: true }));
			await setDefaultChannelLoader(respChannel, clanId);
			delay(jumpChannelOnNotification, 500, store, channelId, clanId);
			delay(() => {
				store.dispatch(appActions.setIsFromFCMMobile(false));
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
			}, 4000);
		} else {
			const linkDirectMessageMatch = link.match(clanDirectMessageLinkRegex);

			// IS message DM
			if (linkDirectMessageMatch) {
				const messageId = linkDirectMessageMatch[1];
				const type = linkDirectMessageMatch[2];

				store.dispatch(appActions.setLoadingMainMobile(false));
				delay(() => {
					store.dispatch(appActions.setIsFromFCMMobile(false));
					save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
				}, 4000);
				if (navigation) {
					navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
						screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
						params: { directMessageId: messageId },
					});
				}
			} else {
				store.dispatch(appActions.setLoadingMainMobile(false));
				delay(() => {
					store.dispatch(appActions.setIsFromFCMMobile(false));
					save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
				}, 4000);
			}
		}

		// TODO: handle navigation
		// handleRemoteNotificationNavigation(notification.data.action, notification);
	} else {
		store.dispatch(appActions.setLoadingMainMobile(false));
		delay(() => {
			store.dispatch(appActions.setIsFromFCMMobile(false));
			save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
		}, 4000);
	}
};

const processNotification = async ({ notification, navigation, time = 0 }) => {
	const store = await getStoreAsync();
	save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, true);
	store.dispatch(appActions.setLoadingMainMobile(true));
	store.dispatch(appActions.setIsFromFCMMobile(true));
	if (time) {
		setTimeout(() => {
			navigateToNotification(store, notification, navigation);
		}, time);
	} else {
		navigateToNotification(store, notification, navigation);
	}
};

export const setupNotificationListeners = async (navigation) => {
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
						time: 2000,
					});
				}
			});
	}

	messaging().onNotificationOpenedApp(async (remoteMessage) => {
		processNotification({
			notification: { ...remoteMessage?.notification, data: remoteMessage?.data },
			navigation,
			time: 0,
		});
	});

	messaging().setBackgroundMessageHandler(async (remoteMessage) => {
		console.log('Message handled in the background!', remoteMessage);
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
				});
				console.log('User pressed notification', detail.notification);

				break;
		}
	});
};
