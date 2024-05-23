import { MezonStoreProvider, accountActions, authActions, getStoreAsync, initStore, selectIsLogin } from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Authentication } from './Authentication';
import { APP_SCREEN } from './ScreenTypes';
import { UnAuthentication } from './UnAuthentication';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChatContextProvider } from '@mezon/core';
import { IWithError } from '@mezon/utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Colors, darkThemeColor, lightThemeColor } from '@mezon/mobile-ui';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaView } from 'react-native';
import { createLocalNotification } from '../utils/pushNotificationHelpers';

const RootStack = createStackNavigator();

const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const [isDarkMode] = useState(true); //TODO: move to custom hook
	useEffect(() => {
		const unsubscribe = messaging().onMessage((remoteMessage) => {
			createLocalNotification(remoteMessage?.notification?.title, remoteMessage?.notification?.body, remoteMessage?.data);
		});

		return unsubscribe;
	}, []);

	useEffect(() => {
		if (isLoggedIn) {
			authLoader();
		}
	}, [isLoggedIn]);

	const authLoader = async () => {
		const store = await getStoreAsync();
		try {
			const response = await store.dispatch(authActions.refreshSession());
			if ((response as unknown as IWithError).error) {
				console.log('Session expired');
				return;
			}

			const profileResponse = await store.dispatch(accountActions.getUserProfile());

			if ((profileResponse as unknown as IWithError).error) {
				console.log('Session expired');
				return;
			}
		} catch (error) {
			console.log('Tom log  => error authLoader', error);
		}
	};

	//TODO: update later
	const lightTheme = {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			...lightThemeColor,
		},
	};

	//TODO: update later
	const darkTheme = {
		...DarkTheme,
		colors: {
			...DarkTheme.colors,
			...darkThemeColor,
		},
	};

	return (
		<NavigationContainer theme={isDarkMode ? darkTheme : lightTheme}>
			<SafeAreaView style={{ flex: 1, backgroundColor: Colors.secondary }}>
				<RootStack.Navigator screenOptions={{ headerShown: false }}>
					{isLoggedIn ? (
						<RootStack.Group
							screenOptions={{
								gestureEnabled: false,
							}}
						>
							<RootStack.Screen name={APP_SCREEN.AUTHORIZE} component={Authentication} />
						</RootStack.Group>
					) : (
						<RootStack.Group
							screenOptions={{
								animationTypeForReplace: 'pop',
								gestureEnabled: false,
							}}
						>
							<RootStack.Screen name={APP_SCREEN.UN_AUTHORIZE} component={UnAuthentication} />
						</RootStack.Group>
					)}
				</RootStack.Navigator>
			</SafeAreaView>
		</NavigationContainer>
	);
};
const RootNavigation = () => {
	const mezon = useMezon();
	const { store, persistor } = useMemo(() => {
		return initStore(mezon, undefined);
	}, [mezon]);

	return (
		<MezonStoreProvider store={store} loading={null} persistor={persistor}>
			<ChatContextProvider>
				<NavigationMain />
			</ChatContextProvider>
		</MezonStoreProvider>
	);
};

export default RootNavigation;
