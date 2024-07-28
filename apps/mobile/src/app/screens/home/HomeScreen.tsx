import { Metrics } from '@mezon/mobile-ui';
import { appActions } from '@mezon/store-mobile';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { useCheckUpdatedVersion } from '../../hooks/useCheckUpdatedVersion';
import LeftDrawerContent from './homedrawer/DrawerContent';
import HomeDefault from './homedrawer/HomeDefault';

const Drawer = createDrawerNavigator();

const HomeScreen = React.memo((props: any) => {
	const dispatch = useDispatch();
	useCheckUpdatedVersion();
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
					Keyboard.dismiss();
					if (e.data.state.history?.length > 1) {
						dispatch(appActions.setHiddenBottomTabMobile(false));
					} else {
						dispatch(appActions.setHiddenBottomTabMobile(true));
					}
				},
			}}
			drawerContent={() => <LeftDrawerContent />}
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

export default HomeScreen;
