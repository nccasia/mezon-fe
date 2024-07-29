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
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Authentication } from './Authentication';
import { APP_SCREEN } from './ScreenTypes';
import { UnAuthentication } from './UnAuthentication';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChatContextProvider } from '@mezon/core';
import { IWithError } from '@mezon/utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { AppState, DeviceEventEmitter, StatusBar } from 'react-native';
import NetInfoComp from '../components/NetworkInfo';
// import SplashScreen from '../components/SplashScreen';
import {
	ActionEmitEvent,
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
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';

const RootStack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const hasInternet = useSelector(selectHasInternetMobile);
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
	}, [currentChannelId, isFromFcmMobile]);

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
		if (state === 'active') {
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: false });
			if (isFromFCM?.toString() === 'true' || isFromFcmMobile) {
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			} else {
				await messageLoaderBackground();
			}
		}
	};

	const messageLoaderBackground = async () => {
		try {
			if (!currentChannelId) {
				return null;
			}
			const store = await getStoreAsync();
			dispatch(appActions.setLoadingMainMobile(false));
			await store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: currentChannelId, noCache: true, isFetchingLatestMessages: true }));
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			return null;
		} catch (error) {
			alert('error messageLoaderBackground' + error.message);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			console.log('error messageLoaderBackground', error);
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
