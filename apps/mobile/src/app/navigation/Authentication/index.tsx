import React, { useEffect } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useAuth } from '@mezon/core';
import { getAppInfo } from '@mezon/mobile-components';
import { fcmActions, selectCurrentClan, selectLoadingMainMobile } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import LoadingModal from '../../components/LoadingModal';
import { handleFCMToken, setupNotificationListeners } from '../../utils/pushNotificationHelpers';
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
	const navigation = useNavigation();
	const { userProfile } = useAuth();
	const currentClan = useSelector(selectCurrentClan);
	const isLoadingMain = useSelector(selectLoadingMainMobile);
	const dispatch = useDispatch();
	useEffect(() => {
		if (userProfile?.email) loadFRMConfig();
	}, [userProfile?.email]);

	useEffect(() => {
		setupNotificationListeners(navigation, currentClan);
	}, [navigation, currentClan]);

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
		</BottomSheetModalProvider>
	);
};
