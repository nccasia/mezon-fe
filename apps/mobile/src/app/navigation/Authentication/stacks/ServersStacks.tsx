import React from 'react';
import {
	CardStyleInterpolators,
	createStackNavigator,
	TransitionSpecs,
} from '@react-navigation/stack';

import {APP_SCREEN} from "../../ScreenTypes";
import ServersScreen from "../../../screens/main/ClanScreen";

// eslint-disable-next-line no-empty-pattern
export const ServersStacks = ({} : any) => {
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
			initialRouteName={APP_SCREEN.SERVERS.HOME}
		>
			{/*Example*/}
			<Stack.Screen
				name={APP_SCREEN.SERVERS.HOME}
				component={ServersScreen}
				// component={ListIconScreens}
				options={{
					cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	);
};
