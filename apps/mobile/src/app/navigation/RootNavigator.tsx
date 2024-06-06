import {
	MezonStoreProvider,
	accountActions,
	authActions,
	emojiSuggestionActions,
	getStoreAsync,
	initStore,
	selectHasInternetMobile,
	selectIsLogin,
} from '@mezon/store-mobile';
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
import {Colors, darkThemeColor, lightThemeColor, useAnimatedState} from '@mezon/mobile-ui';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaView } from 'react-native';
import Toast from 'react-native-toast-message';
import NetInfoComp from '../components/NetworkInfo';
import { createLocalNotification, navigateToNotification } from '../utils/pushNotificationHelpers';
import SplashScreen from "../components/SplashScreen";

const RootStack = createStackNavigator();

const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const [isDarkMode] = useState(true); //TODO: move to custom hook\
	const hasInternet = useSelector(selectHasInternetMobile);
	const [isLoadingSplashScreen, setIsLoadingSplashScreen] = useAnimatedState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoadingSplashScreen(false);
		}, 2500);
		
		const unsubscribe = messaging().onMessage((remoteMessage) => {
			Toast.show({
				type: 'info',
				text1: remoteMessage.notification?.title,
				text2: remoteMessage.notification?.body,
				onPress: async () => {
					Toast.hide();
					await navigateToNotification(remoteMessage, null, null);
				},
			});
		});
		messaging().setBackgroundMessageHandler(async (remoteMessage) => {
			await createLocalNotification(remoteMessage.notification?.title, remoteMessage.notification?.body, remoteMessage.data);
		});

		return () => {
			unsubscribe();
			clearTimeout(timer)
		};
	}, []);

	useEffect(() => {
		if (isLoggedIn && hasInternet) {
			authLoader();
		}
	}, [isLoggedIn, hasInternet]);

	const authLoader = async () => {
		const store = await getStoreAsync();
		store.dispatch(emojiSuggestionActions.fetchEmojiMobile());
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
				<NetInfoComp />
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
			{isLoadingSplashScreen && <SplashScreen />}
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
