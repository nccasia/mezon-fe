import React from 'react';
import {
	CardStyleInterpolators,
	createStackNavigator,
	TransitionSpecs,
} from '@react-navigation/stack';

import { APP_SCREEN } from "../../ScreenTypes";
import Notifications from "../../../screens/main/Notifications";
import MessageID from "../../../screens/main/Messages/MessageID";
// eslint-disable-next-line no-empty-pattern
export const MessagesStacks = ({ }: any) => {
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
			}}>
			<Stack.Screen
				name={APP_SCREEN.MESSAGES.IDMESSAGE}
				component={MessageID}

				options={{
					headerShown: false,
				}}
			/>
			{/*Example*/}
			<Stack.Screen
				name={APP_SCREEN.NOTIFICATION.HOME}
				component={Notifications}
				// component={ListIconScreens}
				options={{
					headerShown: false,
				}}
			/>


		</Stack.Navigator>
	);
};
