import React, { useMemo } from 'react';
import { APP_SCREEN } from './ScreenTypes';
import { createStackNavigator } from '@react-navigation/stack';
import { Authentication } from './Authentication';
import { UnAuthentication } from './UnAuthentication';
import { initStore, MezonStoreProvider, selectIsLogin } from "@mezon/store";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { useMezon } from "@mezon/transport";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { preloadedState } from "../../../../chat/src/app/mock/state";

const RootStack = createStackNavigator();

const NavigationMain = () => {
	const isLoggedIn = true;

	return (
		<NavigationContainer>
			<RootStack.Navigator screenOptions={{ headerShown: false }}>
				{isLoggedIn ? (
					<RootStack.Group
						screenOptions={{
							gestureEnabled: false,
						}}>
						<RootStack.Screen name={APP_SCREEN.AUTHORIZE} component={Authentication} />
					</RootStack.Group>
				) : (
					<RootStack.Group
						screenOptions={{
							animationTypeForReplace: 'pop',
							gestureEnabled: false,
						}}>
						<RootStack.Screen name={APP_SCREEN.UN_AUTHORIZE} component={UnAuthentication} />
					</RootStack.Group>
				)}
			</RootStack.Navigator>
		</NavigationContainer>
	)
}
const RootNavigation = () => {
	// const mezon = useMezon();
	// const { store, persistor } = useMemo(() => {
	// 	return initStore(mezon, preloadedState);
	// }, [mezon]);

	return (
		// <MezonStoreProvider store={store} loading={null} persistor={persistor}>
		<NavigationMain />
		// </MezonStoreProvider>
	);
};

export default RootNavigation;
