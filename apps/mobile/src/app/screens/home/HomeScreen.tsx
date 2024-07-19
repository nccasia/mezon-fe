import { ActionEmitEvent, load, STORAGE_IS_DISABLE_LOAD_BACKGROUND } from '@mezon/mobile-components';
import { appActions, getStoreAsync, messagesActions, selectCurrentChannelId, selectIsFromFCMMobile } from '@mezon/store-mobile';
import { delay } from 'lodash';
import React, { useEffect, useRef } from 'react';
import { AppState, DeviceEventEmitter, Dimensions } from 'react-native';
import { DrawerLayout, DrawerState } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { useCheckUpdatedVersion } from '../../hooks/useCheckUpdatedVersion';
import LeftDrawerContent from './homedrawer/DrawerContent';
import HomeDefault from './homedrawer/HomeDefault';

const HomeScreen = React.memo((props: any) => {
	const homeDrawerRef = useRef<DrawerLayout>(null);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const isFromFcmMobile = useSelector(selectIsFromFCMMobile);
	const dispatch = useDispatch();
	const timerRef = useRef<any>();
	useCheckUpdatedVersion();

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', (state) => {
			if (state === 'active') {
				timerRef.current = delay(handleAppStateChange, 200, state);
			}
		});

		return () => {
			appStateSubscription.remove();
			timerRef?.current && clearTimeout(timerRef.current);
		};
	}, [currentChannelId, isFromFcmMobile]);

	const handleAppStateChange = async (state: string) => {
		const isFromFCM = await load(STORAGE_IS_DISABLE_LOAD_BACKGROUND);
		if (isFromFCM?.toString() === 'true' || isFromFcmMobile) {
			dispatch(appActions.setLoadingMainMobile(false));
			return;
		}
		if (state === 'active' && isFromFCM?.toString() !== 'true' && !isFromFcmMobile) {
			await messageLoaderBackground();
		}
	};

	const messageLoaderBackground = async () => {
		try {
			if (!currentChannelId) {
				dispatch(appActions.setLoadingMainMobile(false));
				return null;
			}
			const store = await getStoreAsync();
			dispatch(appActions.setLoadingMainMobile(false));
			await store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: currentChannelId, noCache: true }));
			return null;
		} catch (error) {
			console.log('error messageLoaderBackground', error);
		}
	};

	useEffect(() => {
		dispatch(appActions.setHiddenBottomTabMobile(true))
	}, [])

	const onDrawerStateChanged = (newState: DrawerState, drawerWillShow: boolean) => {
		if (newState === 'Dragging') {
			dispatch(appActions.setHiddenBottomTabMobile(true))
			return;
		}

		if ((newState === 'Settling')) {
			dispatch(appActions.setHiddenBottomTabMobile(!drawerWillShow))
			return;
		}
	}

	useEffect(() => {
		const sendMessage = DeviceEventEmitter.addListener(ActionEmitEvent.HOME_DRAWER, ({ isShowDrawer }) => {
			if (isShowDrawer) {
				homeDrawerRef.current.openDrawer();
			} else {
				homeDrawerRef.current.closeDrawer();
			}
		});
		return () => {
			sendMessage.remove();
		};
	}, []);

	return (
		<DrawerLayout
			ref={homeDrawerRef}
			edgeWidth={Dimensions.get('window').width}
			drawerWidth={Dimensions.get('window').width}
			enableContextMenu
			drawerPosition={'left'}
			drawerType="back"
			overlayColor="transparent"
			enableTrackpadTwoFingerGesture
			keyboardDismissMode='on-drag'
			useNativeAnimations={true}
			onDrawerStateChanged={onDrawerStateChanged}
			renderNavigationView={(props) => <LeftDrawerContent dProps={props} />}
		>
			<HomeDefault {...props} />
		</DrawerLayout>
	);
});

export default HomeScreen;
