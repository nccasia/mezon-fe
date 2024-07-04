import { Metrics } from '@mezon/mobile-ui';
import {
	appActions,
	channelsActions,
	clansActions,
	directActions,
	friendsActions,
	getStoreAsync,
	messagesActions,
	notificationActions,
	selectAllClans,
	selectCurrentChannelId,
	selectCurrentClan,
	selectSession,
} from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { gifsActions } from 'libs/store/src/lib/giftStickerEmojiPanel/gifs.slice';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useCheckUpdatedVersion } from '../../hooks/useCheckUpdatedVersion';
import LeftDrawerContent from './homedrawer/DrawerContent';
import HomeDefault from './homedrawer/components/HomeDeafult';

const Drawer = createDrawerNavigator();

const DrawerScreen = React.memo(({ navigation }: { navigation: any }) => {
	const dispatch = useDispatch();
	return (
		<Drawer.Navigator
			screenOptions={{
				drawerPosition: 'left',
				drawerType: 'back',
				swipeEdgeWidth: Metrics.screenWidth,
				drawerStyle: {
					width: '85%',
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
					headerShown: false
				}}
			/>
		</Drawer.Navigator>
	);
});

const HomeScreen = React.memo((props: any) => {
	const currentClan = useSelector(selectCurrentClan);
	const clans = useSelector(selectAllClans);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const session = useSelector(selectSession);
	const { reconnect } = useMezon();
	// useCheckUpdatedVersion();

	useEffect(() => {
		if (clans?.length && !currentClan) {
			setCurrentClanLoader();
		}
	}, [clans, currentClan]);

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			appStateSubscription.remove();
		};
	}, [currentClan, currentChannelId]);

	useEffect(() => {
		mainLoader();
	}, [session?.token]);

	const handleAppStateChange = async (state: string) => {
		if (state === 'active') {
			await reconnect();
			await messageLoader();
		}
	};

	const mainLoader = async () => {
		const store = await getStoreAsync();
		store.dispatch(notificationActions.fetchListNotification());
		store.dispatch(friendsActions.fetchListFriends({}));
		store.dispatch(directActions.fetchDirectMessage({}));
		store.dispatch(clansActions.fetchClans());
		store.dispatch(gifsActions.fetchGifCategories());
		store.dispatch(gifsActions.fetchGifCategoryFeatured());
		if (currentClan) {
			store.dispatch(clansActions.joinClan({ clanId: '0' }));
			store.dispatch(clansActions.joinClan({ clanId: currentClan?.clan_id }));
			store.dispatch(clansActions.changeCurrentClan({ clanId: currentClan?.clan_id }));
		}
		return null;
	};

	const messageLoader = async () => {
		const store = await getStoreAsync();
		store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: currentChannelId }));
		store.dispatch(
			channelsActions.joinChannel({
				clanId: currentClan?.clan_id,
				channelId: currentChannelId,
				noFetchMembers: false,
			}),
		);
		return null;
	};

	const setCurrentClanLoader = async () => {
		const lastClanId = clans?.[clans?.length - 1]?.clan_id;
		const store = await getStoreAsync();
		if (lastClanId) {
			store.dispatch(clansActions.joinClan({ clanId: lastClanId }));
			store.dispatch(clansActions.changeCurrentClan({ clanId: lastClanId }));
		}
		return null;
	};

	return <DrawerScreen navigation={props.navigation} />;
});

export default HomeScreen;
