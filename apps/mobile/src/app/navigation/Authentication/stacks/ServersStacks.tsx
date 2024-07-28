import { CardStyleInterpolators, createStackNavigator, TransitionSpecs } from '@react-navigation/stack';
import React from 'react';

import { useTheme } from '@mezon/mobile-ui';
import UpdateGateScreen from '../../../screens/updateGate/UpdateGateScreen';
import { APP_SCREEN } from '../../ScreenTypes';

// eslint-disable-next-line no-empty-pattern
export const ServersStacks = ({ }: any) => {
	const Stack = createStackNavigator();
	const { themeValue } = useTheme();

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
				cardStyle: { backgroundColor: "transparent" },
				cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
			}}
			initialRouteName={APP_SCREEN.SERVERS.HOME}
		>
			<Stack.Screen
				name={APP_SCREEN.SERVERS.UPDATE_GATE}
				component={UpdateGateScreen}
				options={{
					cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	);
};
