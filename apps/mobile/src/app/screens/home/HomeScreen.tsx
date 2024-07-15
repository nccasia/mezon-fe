import { load, save, STORAGE_CLAN_ID, STORAGE_IS_FROM_FCM } from '@mezon/mobile-components';
import { Metrics } from '@mezon/mobile-ui';
import {
	appActions,
	authActions,
	channelsActions,
	clansActions,
	getStoreAsync,
	messagesActions,
	selectCurrentChannelId,
	selectCurrentClan,
} from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { delay } from 'lodash';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useCheckUpdatedVersion } from '../../hooks/useCheckUpdatedVersion';
import LeftDrawerContent from './homedrawer/DrawerContent';
import HomeDefault from './homedrawer/HomeDefault';

const Drawer = createDrawerNavigator();

const DrawerScreen = React.memo(({ navigation }: { navigation: any }) => {
	const dispatch = useDispatch();
	return (
		<Drawer.Navigator
			screenOptions={{
				drawerPosition: 'left',
				drawerType: 'slide',
				swipeEdgeWidth: Metrics.screenWidth,
				swipeMinDistance: 5,
				drawerStyle: {
					width: '100%',
				},
			}}
			screenListeners={{
				state: (e) => {
					if (e.data.state.history?.length > 1) {
						dispatch(appActions.setHiddenBottomTabMobile(false));
					} else {
						dispatch(appActions.setHiddenBottomTabMobile(true));
					}
				},
			}}
			drawerContent={(props) => <LeftDrawerContent dProps={props} />}
		>
			<Drawer.Screen
				name="HomeDefault"
				component={HomeDefault}
				options={{
					drawerType: 'slide',
					swipeEdgeWidth: Metrics.screenWidth,
					keyboardDismissMode: 'none',
					swipeMinDistance: 5,
					headerShown: false,
				}}
			/>
		</Drawer.Navigator>
	);
});

const HomeScreen = React.memo((props: any) => {
	const currentClan = useSelector(selectCurrentClan);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const dispatch = useDispatch();
	const { sessionRef } = useMezon();

	useCheckUpdatedVersion();

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', (state) => {
			if (state === 'active') {
				dispatch(appActions.setLoadingMainMobile(true));
			}
			delay(handleAppStateChange, 800, state);
		});

		return () => {
			appStateSubscription.remove();
		};
	}, [currentClan, currentChannelId]);

	const handleAppStateChange = async (state: string) => {
		const isFromFCM = await load(STORAGE_IS_FROM_FCM);
		if (isFromFCM?.toString() === 'true') {
			dispatch(appActions.setLoadingMainMobile(false));
		}
		if (state === 'active' && isFromFCM?.toString() !== 'true') {
			await messageLoader();
		}
	};

	const messageLoader = async () => {
		if (!currentClan?.clan_id) {
			dispatch(appActions.setLoadingMainMobile(false));
			return null;
		}
		const store = await getStoreAsync();
		sessionRef.current.token = '';
		await store.dispatch(authActions.refreshSession());
		dispatch(appActions.setLoadingMainMobile(false));
		await store.dispatch(clansActions.joinClan({ clanId: '0' }));
		await store.dispatch(clansActions.joinClan({ clanId: currentClan?.clan_id }));
		save(STORAGE_CLAN_ID, currentClan?.clan_id);
		await store.dispatch(clansActions.changeCurrentClan({ clanId: currentClan?.clan_id, noCache: true }));
		await store.dispatch(
			channelsActions.joinChannel({
				clanId: currentClan?.clan_id,
				channelId: currentChannelId,
				noFetchMembers: true,
			}),
		);
		await store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: currentChannelId, noCache: true }));
		return null;
	};

	return <DrawerScreen navigation={props.navigation} />;
});

export default HomeScreen;
