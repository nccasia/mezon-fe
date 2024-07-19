import {
	MezonStoreProvider,
	accountActions,
	appActions,
	authActions,
	channelsActions,
	clansActions,
	directActions,
	emojiSuggestionActions,
	friendsActions,
	getStoreAsync,
	initStore,
	messagesActions,
	notificationActions,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectHasInternetMobile,
	selectIsFromFCMMobile,
	selectIsLogin,
} from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Authentication } from './Authentication';
import { APP_SCREEN } from './ScreenTypes';
import { UnAuthentication } from './UnAuthentication';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChatContext, ChatContextProvider } from '@mezon/core';
import { IWithError } from '@mezon/utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { AppState, StatusBar } from 'react-native';
import NetInfoComp from '../components/NetworkInfo';
// import SplashScreen from '../components/SplashScreen';
import {
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_CLAN_ID,
	STORAGE_IS_DISABLE_LOAD_BACKGROUND,
	load,
	remove,
	save,
	setCurrentClanLoader,
	setDefaultChannelLoader,
} from '@mezon/mobile-components';
import notifee from '@notifee/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { gifsActions } from 'libs/store/src/lib/giftStickerEmojiPanel/gifs.slice';
import { delay } from 'lodash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootStack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const hasInternet = useSelector(selectHasInternetMobile);
	const { reconnect } = useMezon();
	const { setCallbackEventFn } = useContext(ChatContext);
	const dispatch = useDispatch();
	const timerRef = useRef<any>();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const isFromFcmMobile = useSelector(selectIsFromFCMMobile);

	useEffect(() => {
		let timer;
		if (isLoggedIn) {
			dispatch(appActions.setLoadingMainMobile(true));
			timer = delay(initAppLoading, 800);
		}

		return () => {
			timer && clearTimeout(timer);
			timerRef?.current && clearTimeout(timerRef.current);
		};
	}, [isLoggedIn]);

	useEffect(() => {
		const timer = setTimeout(async () => {
			await SplashScreen.hideAsync();
			await notifee.cancelAllNotifications();
			await remove(STORAGE_CHANNEL_CURRENT_CACHE);
		}, 200);

		return () => {
			clearTimeout(timer);
		};
	}, []);

	useEffect(() => {
		let timeout;
		const appStateSubscription = AppState.addEventListener('change', (state) => {
			timeout = delay(handleAppStateChange, 200, state);
		});
		return () => {
			appStateSubscription.remove();
			timeout && clearTimeout(timeout);
		};
	}, [currentClanId, currentChannelId, isFromFcmMobile]);

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', async (state) => {
			if (state === 'active') {
				await notifee.cancelAllNotifications();
			}
			if (state === 'background') {
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, 'false');
				dispatch(appActions.setIsFromFCMMobile(false));
			}
		});
		return () => {
			appStateSubscription.remove();
		};
	}, []);

	useEffect(() => {
		if (isLoggedIn && hasInternet) {
			authLoader();
		}
	}, [isLoggedIn, hasInternet]);

	const initAppLoading = async () => {
		const isFromFCM = await load(STORAGE_IS_DISABLE_LOAD_BACKGROUND);
		await mainLoader({ isFromFCM: isFromFCM?.toString() === 'true' });
	};

	const handleAppStateChange = async (state: string) => {
		const isFromFCM = await load(STORAGE_IS_DISABLE_LOAD_BACKGROUND);
		dispatch(appActions.setLoadingMainMobile(true));
		if (state === 'active') {
			if (isFromFCM?.toString() === 'true' || isFromFcmMobile) {
				dispatch(appActions.setLoadingMainMobile(false));
				return;
			}
			const socket = await reconnect(currentClanId, true);
			if (socket) setCallbackEventFn(socket);

			timerRef.current = setTimeout(() => {
				messageLoaderBackground();
			}, 1500);
		}
	};

	const messageLoaderBackground = async () => {
		try {
			if (!currentChannelId || !currentClanId) {
				dispatch(appActions.setLoadingMainMobile(false));
				return null;
			}
			const store = await getStoreAsync();
			save(STORAGE_CLAN_ID, currentClanId);
			const clanResp = await store.dispatch(clansActions.fetchClans());
			dispatch(appActions.setLoadingMainMobile(false));
			await setCurrentClanLoader(clanResp.payload);
			await store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: currentChannelId, noCache: true }));
			return null;
		} catch (error) {
			alert('error messageLoaderBackground' + error.message);
			dispatch(appActions.setLoadingMainMobile(false));
			console.log('error messageLoaderBackground', error);
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			onClanChangeFromFCM();
		}, 200);

		return () => {
			clearTimeout(timer);
		};
	}, [currentClanId, isFromFcmMobile]);

	const onClanChangeFromFCM = async () => {
		if (currentClanId) {
			const isFromFCM = await load(STORAGE_IS_DISABLE_LOAD_BACKGROUND);
			if (isFromFCM?.toString() === 'true' && isFromFcmMobile) {
				const socket = await reconnect(currentClanId, true);
				if (socket) setCallbackEventFn(socket);
				return;
			}
		}
	};

	const authLoader = async () => {
		const store = await getStoreAsync();
		store.dispatch(emojiSuggestionActions.fetchEmoji({ clanId: '0', noCache: false }));
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

	const mainLoader = async ({ isFromFCM = false }) => {
		try {
			const store = await getStoreAsync();
			await store.dispatch(notificationActions.fetchListNotification());
			await store.dispatch(friendsActions.fetchListFriends({}));
			const clanResp = await store.dispatch(clansActions.fetchClans());
			await store.dispatch(gifsActions.fetchGifCategories());
			await store.dispatch(gifsActions.fetchGifCategoryFeatured());
			await store.dispatch(clansActions.joinClan({ clanId: '0' }));
			dispatch(appActions.setLoadingMainMobile(false));

			// If is from FCM don't join current clan
			if (!isFromFCM) {
				if (currentClanId) {
					save(STORAGE_CLAN_ID, currentClanId);
					await store.dispatch(clansActions.joinClan({ clanId: currentClanId }));
					await store.dispatch(clansActions.changeCurrentClan({ clanId: currentClanId, noCache: true }));
					const respChannel = await store.dispatch(channelsActions.fetchChannels({ clanId: currentClanId, noCache: true }));
					await setDefaultChannelLoader(respChannel.payload, currentClanId);
				} else {
					await store.dispatch(directActions.fetchDirectMessage({}));
					await setCurrentClanLoader(clanResp.payload);
				}
			} else {
				await store.dispatch(directActions.fetchDirectMessage({}));
			}
			return null;
		} catch (error) {
			console.log('error mainLoader', error);
			dispatch(appActions.setLoadingMainMobile(false));
		}
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
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
		</GestureHandlerRootView>
	);
};

const CustomStatusBar = () => {
	const { themeValue, themeBasic } = useTheme();
	// eslint-disable-next-line eqeqeq
	return (
		<StatusBar animated backgroundColor={themeValue.secondary} barStyle={themeBasic == ThemeModeBase.DARK ? 'light-content' : 'dark-content'} />
	);
};

const RootNavigation = () => {
	const mezon = useMezon();
	const { store, persistor } = useMemo(() => {
		if (!mezon) {
			return { store: null, persistor: null };
		}
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
