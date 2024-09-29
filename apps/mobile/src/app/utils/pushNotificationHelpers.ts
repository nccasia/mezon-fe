import {
	STORAGE_CLAN_ID,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	STORAGE_IS_DISABLE_LOAD_BACKGROUND,
	getUpdateOrAddClanChannelCache,
	load,
	save,
	setDefaultChannelLoader
} from '@mezon/mobile-components';
import { appActions, channelsActions, clansActions, getStoreAsync } from '@mezon/store-mobile';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { AndroidVisibility } from '@notifee/react-native/src/types/NotificationAndroid';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { DrawerActions } from '@react-navigation/native';
import { Alert, Linking, Platform } from 'react-native';
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
				style: 'cancel'
			},
			{
				text: 'OK',
				onPress: () => {
					openAppSettings();
				}
			}
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
		await messaging().requestPermission({
			alert: true,
			sound: true,
			badge: true
		});
		// Alert.alert('Notification Permission', 'Notifications have been enabled.');
	} catch (error) {
		Alert.alert('Notification Permission', 'Notification permission denied.', [
			{
				text: 'Cancel',
				style: 'cancel'
			},
			{
				text: 'OK',
				onPress: () => {
					openAppSettings();
				}
			}
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
			name: 'mezon'
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
				sound: 'default',
				pressAction: {
					id: 'default'
				}
			},
			ios: {
				critical: true,
				criticalVolume: 1.0,
				sound: 'default',
				foregroundPresentationOptions: {
					badge: true,
					banner: true,
					list: true,
					sound: true
				}
			}
		});
	} catch (err) {
		console.log('err', err);
	}
};

export const handleFCMToken = async () => {
	const authStatus = await messaging().requestPermission({
		alert: true,
		sound: true,
		badge: true
	});

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

export const navigateToNotification = async (store: any, notification: any, navigation: any, time?: number) => {
	const link = notification?.data?.link;
	if (link) {
		const linkMatch = link.match(clanAndChannelIdLinkRegex);

		// IF is notification to channel
		if (linkMatch) {
			if (navigation) {
				navigation.navigate(APP_SCREEN.HOME as never);
				navigation.dispatch(DrawerActions.closeDrawer());
			}
			const clanId = linkMatch[1];
			const channelId = linkMatch[2];
			const clanIdCache = load(STORAGE_CLAN_ID);
			const isDifferentClan = clanIdCache !== clanId;
			const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
			save(STORAGE_CLAN_ID, clanId);
			if (isDifferentClan) {
				const joinAndChangeClan = async (store: any, clanId: string) => {
					await Promise.all([
						store.dispatch(clansActions.joinClan({ clanId: clanId })),
						store.dispatch(clansActions.changeCurrentClan({ clanId: clanId, noCache: true })),
						store.dispatch(
							channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false, isClearMessage: true })
						)
					]);
				};
				await joinAndChangeClan(store, clanId);
			} else {
				store.dispatch(
					channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false, isClearMessage: true })
				);
			}
			store.dispatch(appActions.setLoadingMainMobile(false));
			setTimeout(() => {
				store.dispatch(appActions.setIsFromFCMMobile(false));
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
			}, 4000);
		} else {
			const linkDirectMessageMatch = link.match(clanDirectMessageLinkRegex);

			// IS message DM
			if (linkDirectMessageMatch) {
				const messageId = linkDirectMessageMatch[1];
				const clanIdCache = load(STORAGE_CLAN_ID);
				store.dispatch(clansActions.joinClan({ clanId: '0' }));
				if (navigation) {
					navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
						screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
						params: { directMessageId: messageId }
					});
				}
				store.dispatch(appActions.setLoadingMainMobile(false));
				// force from killed app call in background apply for back fetch channels
				if (time && Number(clanIdCache || 0) !== 0) {
					const joinChangeFetchAndSetLoader = async (store: any, clanIdCache: string) => {
						const [respCurrentClan, respChannel] = await Promise.all([
							store.dispatch(clansActions.changeCurrentClan({ clanId: clanIdCache, noCache: true, isNotSetCurrentClanId: true })),
							store.dispatch(channelsActions.fetchChannels({ clanId: clanIdCache, noCache: true }))
						]);

						await setDefaultChannelLoader(respChannel.payload, clanIdCache);
					};
					await joinChangeFetchAndSetLoader(store, clanIdCache);
				}
				setTimeout(() => {
					store.dispatch(appActions.setIsFromFCMMobile(false));
					save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
				}, 4000);
			} else {
				store.dispatch(appActions.setLoadingMainMobile(false));
				setTimeout(() => {
					store.dispatch(appActions.setIsFromFCMMobile(false));
					save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
				}, 4000);
			}
		}
	} else {
		store.dispatch(appActions.setLoadingMainMobile(false));
		setTimeout(() => {
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
			navigateToNotification(store, notification, navigation, time);
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
		vibration: true,
		vibrationPattern: [300, 500]
	});

	messaging()
		.getInitialNotification()
		.then(async (remoteMessage) => {
			console.log('Notification caused app to open from quit state:');
			if (remoteMessage) {
				const store = await getStoreAsync();
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, true);
				store.dispatch(appActions.setLoadingMainMobile(true));
				store.dispatch(appActions.setIsFromFCMMobile(true));
				if (remoteMessage?.notification?.title) {
					processNotification({
						notification: { ...remoteMessage?.notification, data: remoteMessage?.data },
						navigation,
						time: 600
					});
				}
			}
		});

	messaging().onNotificationOpenedApp(async (remoteMessage) => {
		processNotification({
			notification: { ...remoteMessage?.notification, data: remoteMessage?.data },
			navigation,
			time: 0
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
					navigation
				});
				console.log('User pressed notification', detail.notification);

				break;
		}
	});
};
