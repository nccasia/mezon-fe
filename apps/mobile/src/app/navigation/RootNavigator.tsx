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
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Authentication } from './Authentication';
import { APP_SCREEN } from './ScreenTypes';
import { UnAuthentication } from './UnAuthentication';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChatContextProvider } from '@mezon/core';
import { IWithError } from '@mezon/utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { AppState, StatusBar } from 'react-native';
import NetInfoComp from '../components/NetworkInfo';
// import SplashScreen from '../components/SplashScreen';
import notifee from '@notifee/react-native';
import * as SplashScreen from 'expo-splash-screen';

const RootStack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const hasInternet = useSelector(selectHasInternetMobile);
	const { reconnect } = useMezon();

	useEffect(() => {
		const timer = setTimeout(async () => {
			await SplashScreen.hideAsync();
			await notifee.cancelAllNotifications();
		}, 200);
		const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			clearTimeout(timer);
			appStateSubscription.remove();
		};
	}, []);

	useEffect(() => {
		if (isLoggedIn && hasInternet) {
			authLoader();
		}
	}, [isLoggedIn, hasInternet]);
	
	const withTimeout = async (promise: Promise<any>, duration: number) => {
		let timeoutId: NodeJS.Timeout;
		const timeoutPromise = new Promise((_, reject) => {
			timeoutId = setTimeout(() => {
				reject(new Error('Operation timed out'));
			}, duration);
		});
		
		const result = await Promise.race([promise, timeoutPromise]);
		clearTimeout(timeoutId);
		return result;
	};
	
	const handleAppStateChange = async (state: string) => {
		if (state === 'active') {
			withTimeout(reconnect(), 1500)
				.then(() => {
					console.log('Reconnected successfully');
				})
				.catch((e) => {
					console.log('Failed to reconnect or operation timed out', e);
				});
			await notifee.cancelAllNotifications();
		}
	};

	const authLoader = async () => {
		const store = await getStoreAsync();
		store.dispatch(emojiSuggestionActions.fetchEmoji({ clanId: "0", noCache: false }));
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

	return (
		<NavigationContainer>
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
			{/*{isLoadingSplashScreen && <SplashScreen />}*/}
		</NavigationContainer>
	);
};

const CustomStatusBar = () => {
	const { themeValue, themeBasic } = useTheme();
	// eslint-disable-next-line eqeqeq
	return <StatusBar animated backgroundColor={themeValue.secondary} barStyle={themeBasic == ThemeModeBase.DARK ? 'light-content' : 'dark-content'} />;
};

const RootNavigation = () => {
	const mezon = useMezon();
	const { store, persistor } = useMemo(() => {
		return initStore(mezon, undefined);
	}, [mezon]);

	return (
		<MezonStoreProvider store={store} loading={null} persistor={persistor}>
			<CustomStatusBar />
			<ChatContextProvider>
				<NavigationMain />
			</ChatContextProvider>
		</MezonStoreProvider>
	);
};

export default RootNavigation;
