import { selectIsLogin } from '@mezon/store-mobile';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import { useSelector } from 'react-redux';
import { Authentication } from './Authentication';
import { APP_SCREEN } from './ScreenTypes';
import { UnAuthentication } from './UnAuthentication';

const Root = createStackNavigator();

const RootStack = () => {
	const isLoggedIn = useSelector(selectIsLogin);

	useEffect(() => {
		const timer = setTimeout(async () => {
			await BootSplash.hide({ fade: true });
		}, 10);
		return () => clearTimeout(timer);
	}, []);
	return (
		<Root.Navigator screenOptions={{ headerShown: false }}>
			{isLoggedIn ? (
				<Root.Group
					screenOptions={{
						gestureEnabled: false
					}}
				>
					<Root.Screen name={APP_SCREEN.AUTHORIZE} component={Authentication} />
				</Root.Group>
			) : (
				<Root.Group
					screenOptions={{
						animationTypeForReplace: 'pop',
						gestureEnabled: false
					}}
				>
					<Root.Screen name={APP_SCREEN.UN_AUTHORIZE} component={UnAuthentication} />
				</Root.Group>
			)}
		</Root.Navigator>
	);
};

export default RootStack;
