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
import { darkThemeColor, lightThemeColor, useAnimatedState } from '@mezon/mobile-ui';
import { AppState } from 'react-native';
import NetInfoComp from '../components/NetworkInfo';
import SplashScreen from '../components/SplashScreen';

const RootStack = createStackNavigator();

const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const [isDarkMode] = useState(true); //TODO: move to custom hook\
	const hasInternet = useSelector(selectHasInternetMobile);
	const [isLoadingSplashScreen, setIsLoadingSplashScreen] = useAnimatedState(true);
	const { reconnect } = useMezon();

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoadingSplashScreen(false);
		}, 2500);
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

	const handleAppStateChange = async (state: string) => {
		reconnect().catch((e) => 'trying to reconnect');
	};

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
