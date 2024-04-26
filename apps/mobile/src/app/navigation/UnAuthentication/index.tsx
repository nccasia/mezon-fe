import React, { useEffect } from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { APP_SCREEN } from '../ScreenTypes';
import LoginScreen from "../../screens/auth/LoginScreen";
import RegisterScreen from "../../screens/auth/RegisterScreen";
import {Appearance} from "react-native";

const Stack = createNativeStackNavigator();

export const UnAuthentication = () => {
	const getInitialRouteName = APP_SCREEN.LOGIN;
	
	useEffect(() => {
		// TODO: handle dark mode light mode
		// const isDarkTheme = Appearance.getColorScheme() === 'dark';
		
		// dispatch(appActions.onSetAppTheme('dark'));
		// return () => {
		// 	dispatch(appActions.onSetAppTheme('default'));
		// };
	}, []);
	
	
	return (
		<Stack.Navigator
			initialRouteName={getInitialRouteName}
			screenOptions={{ headerShown: false, gestureEnabled: true }}>
			<Stack.Screen name={APP_SCREEN.LOGIN} component={LoginScreen} />
			<Stack.Screen name={APP_SCREEN.REGISTER} component={RegisterScreen} />
		</Stack.Navigator>
	);
};
