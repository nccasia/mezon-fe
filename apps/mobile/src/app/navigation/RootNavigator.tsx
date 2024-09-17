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
	selectCurrentChannelId,
	selectCurrentClanId,
	selectHasInternetMobile,
	selectIsFromFCMMobile,
	selectIsLogin,
	voiceActions
} from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { NavigationContainer } from '@react-navigation/native';
import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChatContextProvider } from '@mezon/core';
import { IWithError } from '@mezon/utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
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
	setDefaultChannelLoader
} from '@mezon/mobile-components';
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import notifee from '@notifee/react-native';
import { ChannelType } from 'mezon-js';
import { AppState, DeviceEventEmitter, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import NetInfoComp from '../components/NetworkInfo';
import SplashScreen from '../components/SplashScreen';
import { toastConfig } from '../configs/toastConfig';
const MyStackComponent = lazy(() => import('./RootStack'));

const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const hasInternet = useSelector(selectHasInternetMobile);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const isFromFcmMobile = useSelector(selectIsFromFCMMobile);
	const [isReadyForUse, setIsReadyForUse] = useState<boolean>(false);

	useEffect(() => {
		const timer = setTimeout(async () => {
			setIsReadyForUse(true);
			await notifee.cancelAllNotifications();
			await remove(STORAGE_CHANNEL_CURRENT_CACHE);
			await remove(STORAGE_KEY_TEMPORARY_ATTACHMENT);
		}, 500);

		const timerScrollToActive = setTimeout(async () => {
			DeviceEventEmitter.emit(ActionEmitEvent.SCROLL_TO_ACTIVE_CHANNEL, { timeout: 100 });
		}, 4000);
		return () => {
			clearTimeout(timer);
			clearTimeout(timerScrollToActive);
		};
	}, []);

	useEffect(() => {
		if (isLoggedIn) {
			initAppLoading();
		}
	}, [isLoggedIn]);

	useEffect(() => {
		// Trigger when app is in background back to active
		let timeout: string | number | NodeJS.Timeout;
		const appStateSubscription = AppState.addEventListener('change', (state) => {
			if (isLoggedIn)
				timeout = setTimeout(async () => {
					await handleAppStateChange(state);
				}, 200);
		});
		return () => {
			appStateSubscription.remove();
			timeout && clearTimeout(timeout);
		};
	}, [currentChannelId, isFromFcmMobile, isLoggedIn, currentClanId]);

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
					isClearMessage: true
				})
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
			// Note: if currentClanId === 0 is current DM
			if (state === 'active' && currentClanId !== '0') {
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: false });
				if (isFromFCM?.toString() === 'true' || isFromFcmMobile) {
					DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
				} else {
					await messageLoaderBackground();
				}
			}
		},
		[isFromFcmMobile, currentChannelId, currentClanId]
	);

	const messageLoaderBackground = useCallback(async () => {
		try {
			if (!currentChannelId) {
				return null;
			}
			const store = await getStoreAsync();
			store.dispatch(appActions.setLoadingMainMobile(false));
			const promise = [
				store.dispatch(
					messagesActions.fetchMessages({
						channelId: currentChannelId,
						noCache: true,
						isFetchingLatestMessages: true,
						isClearMessage: true
					})
				),
				store.dispatch(
					voiceActions.fetchVoiceChannelMembers({
						clanId: currentClanId ?? '',
						channelId: '',
						channelType: ChannelType.CHANNEL_TYPE_VOICE
					})
				)
			];
			await Promise.all(promise);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			return null;
		} catch (error) {
			// alert('error messageLoaderBackground' + error.message);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			console.log('error messageLoaderBackground', error);
		}
	}, [currentChannelId]);

	const switchClanLoader = async () => {
		const store = await getStoreAsync();
		await Promise.all([store.dispatch(emojiSuggestionActions.fetchEmoji({ clanId: currentClanId || '0', noCache: true }))]);
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
			console.log('error authLoader', error);
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
				promises.push(store.dispatch(clansActions.joinClan({ clanId: '0' })));
				promises.push(store.dispatch(directActions.fetchDirectMessage({})));
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
		[currentClanId]
	);

	return (
		<NavigationContainer>
			<Suspense fallback={<SplashScreen />}>
				<NetInfoComp />
				{isReadyForUse && <MyStackComponent />}
			</Suspense>
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
