import React from 'react';
import {
	CardStyleInterpolators,
	createStackNavigator,
	TransitionSpecs,
} from '@react-navigation/stack';

import {APP_SCREEN} from "../../ScreenTypes";
import Notifications from "../../../screens/main/Notifications";
import NotificationsDetail from "../../../screens/main/NotificationsDetail";

// eslint-disable-next-line no-empty-pattern
export const NotificationStacks = ({} : any) => {
	const Stack = createStackNavigator();
	
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				headerShadowVisible: false,
				gestureEnabled: true,
				gestureDirection: 'horizontal',
				transitionSpec: {
					open: TransitionSpecs.TransitionIOSSpec,
					close: TransitionSpecs.TransitionIOSSpec,
				},
				cardStyle: { backgroundColor: 'white' },
				cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
			}}
			initialRouteName={APP_SCREEN.NOTIFICATION.HOME}>
			<Stack.Screen
				name={APP_SCREEN.NOTIFICATION.HOME}
				component={Notifications}
				// component={ListIconScreens}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name={APP_SCREEN.NOTIFICATION.DETAIL}
				component={NotificationsDetail}
				// component={ListIconScreens}
				options={{
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	);
};
