import {
	MezonStoreProvider,
	accountActions,
	appActions,
	authActions,
	channelsActions,
	clansActions,
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Authentication } from './Authentication';
import { APP_SCREEN } from './ScreenTypes';
import { UnAuthentication } from './UnAuthentication';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChatContextProvider } from '@mezon/core';
import { IWithError } from '@mezon/utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { AppState, DeviceEventEmitter, StatusBar, View } from 'react-native';
import NetInfoComp from '../components/NetworkInfo';
// import SplashScreen from '../components/SplashScreen';
import {
	ActionEmitEvent,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_CLAN_ID,
	STORAGE_IS_DISABLE_LOAD_BACKGROUND,
	STORAGE_KEY_TEMPORARY_ATTACHMENT,
	load,
	remove,
	save,
	setCurrentClanLoader,
	setDefaultChannelLoader,
} from '@mezon/mobile-components';
import { gifsActions } from '@mezon/store-mobile';
import notifee from '@notifee/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { delay } from 'lodash';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';

const RootStack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const hasInternet = useSelector(selectHasInternetMobile);
	const dispatch = useDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const isFromFcmMobile = useSelector(selectIsFromFCMMobile);
	const [isReadyForUse, setIsReadyForUse] = useState<boolean>(false);
	const previousClanIdRef = useRef<string | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsReadyForUse(true);
		}, 900);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (isLoggedIn) {
			// dispatch(appActions.setLoadingMainMobile(true));
			initAppLoading();
		}
	}, [isLoggedIn]);

	useEffect(() => {
		const timer = setTimeout(async () => {
			await SplashScreen.hideAsync();
			await notifee.cancelAllNotifications();
			await remove(STORAGE_CHANNEL_CURRENT_CACHE);
			await remove(STORAGE_KEY_TEMPORARY_ATTACHMENT);
		}, 1000);

		return () => {
			clearTimeout(timer);
		};
	}, []);

	useEffect(() => {
		let timeout: string | number | NodeJS.Timeout;
		const appStateSubscription = AppState.addEventListener('change', (state) => {
			if (isLoggedIn) timeout = delay(handleAppStateChange, 200, state);
		});
		return () => {
			appStateSubscription.remove();
			timeout && clearTimeout(timeout);
		};
	}, [currentChannelId, isFromFcmMobile, isLoggedIn]);

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
			refreshMessageInitApp();
			authLoader();
		}
	}, [isLoggedIn, hasInternet]);

	useEffect(() => {
		if (currentClanId) {
			switchClanLoader();
		}
	}, [currentClanId]);

	const refreshMessageInitApp = useCallback(async () => {
		const store = await getStoreAsync();
		if (currentChannelId) {
			store.dispatch(
				messagesActions.fetchMessages({
					channelId: currentChannelId,
					noCache: true,
					isFetchingLatestMessages: true,
				}),
			);
		}
	}, [currentChannelId]);

	const initAppLoading = useCallback(async () => {
		const isFromFCM = await load(STORAGE_IS_DISABLE_LOAD_BACKGROUND);
		await mainLoader({ isFromFCM: isFromFCM?.toString() === 'true' });
	}, []);

	const handleAppStateChange = useCallback(
		async (state: string) => {
			const isFromFCM = await load(STORAGE_IS_DISABLE_LOAD_BACKGROUND);
			if (state === 'active') {
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: false });
				if (isFromFCM?.toString() === 'true' || isFromFcmMobile) {
					DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
				} else {
					await messageLoaderBackground();
				}
			}
		},
		[isFromFcmMobile],
	);

	const messageLoaderBackground = useCallback(async () => {
		try {
			if (!currentChannelId) {
				return null;
			}
			const store = await getStoreAsync();
			store.dispatch(appActions.setLoadingMainMobile(false));
			store.dispatch(
				messagesActions.fetchMessages({
					channelId: currentChannelId,
					noCache: true,
					isFetchingLatestMessages: true,
				}),
			);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			return null;
		} catch (error) {
			alert('error messageLoaderBackground' + error.message);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			console.log('error messageLoaderBackground', error);
		}
	}, [currentChannelId]);

	const switchClanLoader = async () => {
		const promises = [];
		const store = await getStoreAsync();
		promises.push(store.dispatch(emojiSuggestionActions.fetchEmoji({ clanId: currentClanId || '0', noCache: true })));
		promises.push(store.dispatch(notificationActions.fetchListNotification(currentClanId)));
		await Promise.all(promises);
	};
	const authLoader = useCallback(async () => {
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
	}, []);

	const mainLoader = useCallback(
		async ({ isFromFCM = false }) => {
			const store = await getStoreAsync();
			try {
				const currentClanIdCached = await load(STORAGE_CLAN_ID);
				const clanId = currentClanId?.toString() !== '0' ? currentClanId : currentClanIdCached;
				const promises = [];

				if (!isFromFCM) {
					promises.push(store.dispatch(clansActions.fetchClans()));
					if (clanId) {
						save(STORAGE_CLAN_ID, clanId);
						promises.push(store.dispatch(clansActions.joinClan({ clanId })));
						promises.push(store.dispatch(clansActions.changeCurrentClan({ clanId, noCache: true })));
						promises.push(store.dispatch(channelsActions.fetchChannels({ clanId, noCache: true })));
					}
				}

				promises.push(store.dispatch(friendsActions.fetchListFriends({})));
				promises.push(store.dispatch(gifsActions.fetchGifCategories()));
				promises.push(store.dispatch(gifsActions.fetchGifCategoryFeatured()));
				promises.push(store.dispatch(clansActions.joinClan({ clanId: '0' })));

				const results = await Promise.all(promises);

				if (!isFromFCM) {
					const respChannel = results.find((result) => result.type === 'channels/fetchChannels/fulfilled');
					if (respChannel && clanId) {
						await setDefaultChannelLoader(respChannel.payload, clanId);
					} else {
						const clanResp = results.find((result) => result.type === 'clans/fetchClans/fulfilled');
						if (clanResp && !clanId) {
							await setCurrentClanLoader(clanResp.payload);
						}
					}
				}

				store.dispatch(appActions.setLoadingMainMobile(false));
				return null;
			} catch (error) {
				console.log('error mainLoader', error);
				store.dispatch(appActions.setLoadingMainMobile(false));
			}
		},
		[currentClanId],
	);

	if (!isReadyForUse) {
		return <View />;
	}

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
			<Toast config={toastConfig} />
		</MezonStoreProvider>
	);
};

export default RootNavigation;
