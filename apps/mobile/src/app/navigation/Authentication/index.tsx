import React, { useEffect, useRef, useState } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useAuth } from '@mezon/core';
import { CHANNEL_ID_SHARING, getAppInfo } from '@mezon/mobile-components';
import {
	appActions,
	fcmActions,
	getStoreAsync,
	referencesActions,
	selectCurrentChannel,
	selectCurrentClan,
	selectDmGroupCurrentId,
	selectLoadingMainMobile,
} from '@mezon/store-mobile';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import LoadingModal from '../../components/LoadingModal';
import { useCheckUpdatedVersion } from '../../hooks/useCheckUpdatedVersion';
import { Sharing } from '../../screens/settings/Sharing';
import {
	checkNotificationPermission,
	createLocalNotification,
	handleFCMToken,
	isShowNotification,
	navigateToNotification,
	setupNotificationListeners,
} from '../../utils/pushNotificationHelpers';
import { APP_SCREEN } from '../ScreenTypes';
import BottomNavigator from './BottomNavigator';
import { FriendStacks } from './stacks/FriendStacks';
import { MenuChannelStacks } from './stacks/MenuChannelStack';
import { MenuClanStacks } from './stacks/MenuSererStack';
import { MenuThreadDetailStacks } from './stacks/MenuThreadDetailStacks';
import { MessagesStacks } from './stacks/MessagesStacks';
import { NotificationStacks } from './stacks/NotificationStacks';
import { ServersStacks } from './stacks/ServersStacks';
import { SettingStacks } from './stacks/SettingStacks';
const RootStack = createNativeStackNavigator();

export const Authentication = () => {
	const getInitialRouteName = APP_SCREEN.BOTTOM_BAR;
	const navigation = useNavigation<any>();
	const { userProfile } = useAuth();
	const currentClan = useSelector(selectCurrentClan);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentDmGroupId = useSelector(selectDmGroupCurrentId);
	const isLoadingMain = useSelector(selectLoadingMainMobile);
	const dispatch = useDispatch();
	const [fileShared, setFileShared] = useState<any>();
	const currentDmGroupIdRef = useRef(currentDmGroupId);
	const currentChannelRef = useRef(currentClan);
	useCheckUpdatedVersion();

	useEffect(() => {
		if (userProfile?.email) loadFRMConfig();
	}, [userProfile?.email]);

	useEffect(() => {
		setupNotificationListeners(navigation);
	}, [navigation]);

	useEffect(() => {
		currentDmGroupIdRef.current = currentDmGroupId;
	}, [currentDmGroupId]);

	useEffect(() => {
		currentChannelRef.current = currentChannel;
	}, [currentChannel]);

	useEffect(() => {
		checkNotificationPermission();

		const unsubscribe = messaging().onMessage((remoteMessage) => {
			if (isShowNotification(currentChannelRef.current?.id, currentDmGroupIdRef.current, remoteMessage)) {
				Toast.show({
					type: 'info',
					text1: remoteMessage.notification?.title,
					text2: remoteMessage.notification?.body,
					topOffset: Platform.OS === "ios" ? undefined : 10,
					onPress: async () => {
						Toast.hide();
						const store = await getStoreAsync();
						store.dispatch(appActions.setLoadingMainMobile(true));
						store.dispatch(appActions.setIsFromFCMMobile(true));
						await navigateToNotification(store, remoteMessage, navigation);
					},
				});
			}
		});
		messaging().setBackgroundMessageHandler(async (remoteMessage) => {
			await createLocalNotification(remoteMessage.notification?.title, remoteMessage.notification?.body, remoteMessage.data);
		});

		const timeout = setTimeout(() => {
			// To get All Received Urls
			loadFileSharing();
		}, 2000);

		// To clear Intents
		return () => {
			clearTimeout(timeout);
			unsubscribe();
		};
	}, []);

	const loadFileSharing = async () => {
		try {
			await ReceiveSharingIntent.getReceivedFiles(
				(files: any) => {
					setFileShared(files);
				},
				(error: any) => {
					console.log('Error receiving files:', error);
				},
				'mezon.mobile.sharing',
			);
		} catch (error) {
			console.log('Error while receiving files:', error);
		}
	};
	
	const loadFRMConfig = async () => {
		try {
			const [fcmtoken, appInfo] = await Promise.all([handleFCMToken(), getAppInfo()]);
			if (fcmtoken) {
				const { app_device_id: deviceId, app_platform: platform } = appInfo;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				dispatch(fcmActions.registFcmDeviceToken({ tokenId: fcmtoken, deviceId, platform }));
			}
		} catch (error) {
			console.error('Error loading FCM config:', error);
		}
	};

	const onCloseFileShare = () => {
		setFileShared(undefined);
		dispatch(
			referencesActions.resetDataAttachment({
				channelId: CHANNEL_ID_SHARING,
			}),
		);
		navigation.goBack();
	};

	return (
		<BottomSheetModalProvider>
			<RootStack.Navigator
				initialRouteName={getInitialRouteName}
				screenOptions={{
					headerShown: false,
					gestureEnabled: true,
					gestureDirection: 'horizontal',
				}}
			>
				<RootStack.Screen name={APP_SCREEN.BOTTOM_BAR} component={BottomNavigator} options={{ gestureEnabled: false }} />
				<RootStack.Screen name={APP_SCREEN.SERVERS.STACK} children={(props) => <ServersStacks {...props} />} />
				<RootStack.Screen name={APP_SCREEN.MESSAGES.STACK} children={(props) => <MessagesStacks {...props} />} />
				<RootStack.Screen name={APP_SCREEN.NOTIFICATION.STACK} children={(props) => <NotificationStacks {...props} />} />
				<RootStack.Screen name={APP_SCREEN.MENU_CHANNEL.STACK} children={(props) => <MenuChannelStacks {...props} />} />

				<RootStack.Screen name={APP_SCREEN.MENU_THREAD.STACK} children={(props) => <MenuThreadDetailStacks {...props} />} />

				<RootStack.Screen name={APP_SCREEN.MENU_CLAN.STACK} children={(props) => <MenuClanStacks {...props} />} />

				<RootStack.Screen name={APP_SCREEN.SETTINGS.STACK} children={(props) => <SettingStacks {...props} />} />

				<RootStack.Screen name={APP_SCREEN.FRIENDS.STACK} children={(props) => <FriendStacks {...props} />} />
			</RootStack.Navigator>
			<LoadingModal isVisible={isLoadingMain} />
			{!!fileShared && !isLoadingMain && <Sharing data={fileShared} onClose={onCloseFileShare} />}
		</BottomSheetModalProvider>
	);
};
