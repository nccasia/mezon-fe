import React, { useEffect } from 'react';
import { ChatContextProvider } from '@mezon/core';
import {
	appActions, clansActions, getStoreAsync,
	selectAllClans, selectCurrentClan, notificationActions, friendsActions, directActions,
	gifsActions
} from '@mezon/store-mobile';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import HashSignIcon from '../../../assets/svg/loading.svg';
import LeftDrawerContent from './homedrawer/DrawerContent';
import HomeDefault from './homedrawer/HomeDefault';
import { styles } from './styles';
import { BarsIcon, DiscoverySearchIcon, UserIcon } from '@mezon/mobile-components';

const Drawer = createDrawerNavigator();

const DrawerScreen = React.memo(({ navigation }: { navigation: any }) => {
	const dispatch = useDispatch();

	return (
		<Drawer.Navigator
			screenOptions={{
				drawerPosition: 'left',
				drawerStyle: {
					width: '85%',
				},
			}}
			screenListeners={{
				state: (e) => {
					if (e.data.state.history.length > 1) {
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
					headerTitleAlign: 'left',
					headerStyle: {
						backgroundColor: 'grey',
					},
					headerShown: false,
					headerLeft(vals) {
						return (
							<View style={styles.drawerHeaderLeft} {...vals} onTouchEnd={() => navigation.openDrawer()}>
								<BarsIcon width={20} height={20} />
							</View>
						);
					},

					headerTitle(props) {
						return (
							<View style={styles.drawerHeaderTitle}>
								<HashSignIcon width={18} height={18} />
								<Text style={styles.drawerHeaderTitleTxt}>welcome-and-rules</Text>
							</View>
						);
					},

					headerRight(props) {
						return (
							<View style={styles.drawerHeaderRight}>
								<DiscoverySearchIcon width={22} height={22} />
								<UserIcon width={22} height={22} />
							</View>
						);
					},
				}}
			/>
		</Drawer.Navigator>
	);
});

const HomeScreen = React.memo((props: any) => {
	const currentClan = useSelector(selectCurrentClan);
	const clans = useSelector(selectAllClans);

	useEffect(() => {
		if (clans?.length) {
			setCurrentClanLoader();
		}
	}, [clans]);

	useEffect(() => {
		mainLoader();
	}, []);

	const mainLoader = async () => {
		const store = await getStoreAsync();

		store.dispatch(notificationActions.fetchListNotification());
		store.dispatch(friendsActions.fetchListFriends());
		store.dispatch(directActions.fetchDirectMessage({}));
		store.dispatch(clansActions.fetchClans());
		store.dispatch(gifsActions.fetchGifCategories());
		store.dispatch(gifsActions.fetchGifCategoryFeatured());

		if (currentClan) {
			store.dispatch(clansActions.changeCurrentClan({ clanId: currentClan.clan_id }));
		}

		return null;
	};

	const setCurrentClanLoader = async () => {
		const lastClanId = clans[clans.length - 1].clan_id;
		const store = await getStoreAsync();
		if (lastClanId) {
			store.dispatch(clansActions.changeCurrentClan({ clanId: lastClanId }));
		}
		return null;
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ChatContextProvider>
				<DrawerScreen navigation={props.navigation} />
			</ChatContextProvider>
		</SafeAreaView>
	);
});

export default HomeScreen;
