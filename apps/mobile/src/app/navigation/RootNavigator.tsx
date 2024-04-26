import React from 'react';
import { APP_SCREEN } from './ScreenTypes';
import { createStackNavigator } from '@react-navigation/stack';
import { Authentication } from './Authentication';
import { UnAuthentication } from './UnAuthentication';
import {selectIsLogin} from "@mezon/store";
import {useSelector} from "react-redux";
import {NavigationContainer} from "@react-navigation/native";

const RootStack = createStackNavigator();

const RootNavigation = () => {
	const isLoggedIn = true;
	// const isLoggedIn = useSelector(selectIsLogin);

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
	);
};

export default RootNavigation;
