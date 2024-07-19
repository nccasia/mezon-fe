import { ActionEmitEvent } from '@mezon/mobile-components';
import { appActions } from '@mezon/store-mobile';
import React, { useEffect, useRef } from 'react';
import { DeviceEventEmitter, Dimensions } from 'react-native';
import { DrawerLayout, DrawerState } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { useCheckUpdatedVersion } from '../../hooks/useCheckUpdatedVersion';
import LeftDrawerContent from './homedrawer/DrawerContent';
import HomeDefault from './homedrawer/HomeDefault';

const HomeScreen = React.memo((props: any) => {
	const homeDrawerRef = useRef<DrawerLayout>(null);
	const dispatch = useDispatch();
	useCheckUpdatedVersion();

	useEffect(() => {
		dispatch(appActions.setHiddenBottomTabMobile(true));
	}, []);

	const onDrawerStateChanged = (newState: DrawerState, drawerWillShow: boolean) => {
		if (newState === 'Dragging') {
			dispatch(appActions.setHiddenBottomTabMobile(true));
			return;
		}

		if (newState === 'Settling') {
			dispatch(appActions.setHiddenBottomTabMobile(!drawerWillShow));
			return;
		}
	};

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
			keyboardDismissMode="on-drag"
			useNativeAnimations={true}
			onDrawerStateChanged={onDrawerStateChanged}
			renderNavigationView={() => <LeftDrawerContent />}
		>
			<HomeDefault {...props} />
		</DrawerLayout>
	);
});

export default HomeScreen;
