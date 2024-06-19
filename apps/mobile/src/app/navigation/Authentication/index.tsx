import React, { useEffect, useState } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useAuth, useReference } from '@mezon/core';
import { getAppInfo } from '@mezon/mobile-components';
import { fcmActions, selectCurrentClan, selectLoadingMainMobile } from '@mezon/store-mobile';
import messaging from '@react-native-firebase/messaging';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BackHandler } from 'react-native';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import LoadingModal from '../../components/LoadingModal';
import { Sharing } from '../../screens/settings/Sharing';
import {
	checkNotificationPermission,
	createLocalNotification,
	handleFCMToken,
	navigateToNotification,
	setupNotificationListeners,
} from '../../utils/pushNotificationHelpers';
import { APP_SCREEN } from '../ScreenTypes';
import BottomNavigator from './BottomNavigator';
import { FriendStacks } from './stacks/FriendStacks';
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
	const isLoadingMain = useSelector(selectLoadingMainMobile);
	const dispatch = useDispatch();
	const [fileShared, setFileShared] = useState<any>();
	const { setAttachmentData } = useReference();

	useEffect(() => {
		if (userProfile?.email) loadFRMConfig();
	}, [userProfile?.email]);

	useEffect(() => {
		setupNotificationListeners(navigation, currentClan);
	}, [navigation, currentClan]);

	useEffect(() => {
		checkNotificationPermission();

		const unsubscribe = messaging().onMessage((remoteMessage) => {
			if (remoteMessage.notification?.title) {
				Toast.show({
					type: 'info',
					text1: remoteMessage.notification?.title,
					text2: remoteMessage.notification?.body,
					onPress: async () => {
						Toast.hide();
						navigation.navigate(APP_SCREEN.HOME);
						await navigateToNotification(remoteMessage, null, null);
						navigation.dispatch(DrawerActions.closeDrawer());
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
				'com.mezon.mobile',
			);
		} catch (error) {
			console.log('Error while receiving files:', error);
		}
	};

	const loadFRMConfig = async () => {
		const fcmtoken = await handleFCMToken();
		if (fcmtoken) {
			const deviceId = getAppInfo().app_device_id;
			const platform = getAppInfo().app_platform;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			dispatch(fcmActions.registFcmDeviceToken({ tokenId: fcmtoken, deviceId: deviceId, platform: platform }));
		}
	};

	const onCloseFileShare = () => {
		setFileShared(undefined);
		setAttachmentData([]);
		BackHandler.exitApp();
	};

	return (
		<BottomSheetModalProvider>
			<RootStack.Navigator initialRouteName={getInitialRouteName} screenOptions={{ headerShown: false, gestureEnabled: true }}>
				<RootStack.Screen name={APP_SCREEN.BOTTOM_BAR} component={BottomNavigator} options={{ gestureEnabled: false }} />
				<RootStack.Screen
					name={APP_SCREEN.SERVERS.STACK}
					children={(props) => <ServersStacks {...props} />}
					options={{
						gestureEnabled: true,
						gestureDirection: 'horizontal',
					}}
				/>
				<RootStack.Screen
					name={APP_SCREEN.MESSAGES.STACK}
					children={(props) => <MessagesStacks {...props} />}
					options={{
						gestureEnabled: true,
						gestureDirection: 'horizontal',
					}}
				/>
				<RootStack.Screen
					name={APP_SCREEN.NOTIFICATION.STACK}
					children={(props) => <NotificationStacks {...props} />}
					options={{
						gestureEnabled: true,
						gestureDirection: 'horizontal',
					}}
				/>
				<RootStack.Screen
					name={APP_SCREEN.MENU_THREAD.STACK}
					children={(props) => <MenuThreadDetailStacks {...props} />}
					options={{
						gestureEnabled: true,
						gestureDirection: 'horizontal',
					}}
				/>

				<RootStack.Screen
					name={APP_SCREEN.MENU_CLAN.STACK}
					children={(props) => <MenuClanStacks {...props} />}
					options={{
						gestureEnabled: true,
						gestureDirection: 'horizontal',
					}}
				/>

				<RootStack.Screen
					name={APP_SCREEN.SETTINGS.STACK}
					children={(props) => <SettingStacks {...props} />}
					options={{
						gestureEnabled: true,
						gestureDirection: 'horizontal',
					}}
				/>

				<RootStack.Screen
					name={APP_SCREEN.FRIENDS.STACK}
					children={(props) => <FriendStacks {...props} />}
					options={{
						gestureEnabled: true,
						gestureDirection: 'horizontal',
					}}
				/>
			</RootStack.Navigator>
			<LoadingModal isVisible={isLoadingMain} />
			{!!fileShared && !isLoadingMain && <Sharing data={fileShared} onClose={onCloseFileShare} />}
		</BottomSheetModalProvider>
	);
};
