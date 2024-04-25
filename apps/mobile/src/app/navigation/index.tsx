import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { StackNavigationOptions, createStackNavigator, TransitionPresets, } from '@react-navigation/stack';
import BottomNavigator from './BottomNavigator';
import SplashScreen from '../screens/loading/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DrawerNavigator from './DrawerNavigator';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { useMemo } from 'react';
const Stack = createStackNavigator()
const Navigation = () => {
	const [isUser, setIsUser] = useState(false)
	const [isAppLoading, setIsAppLoading] = useState(false)
	const screenOptions = useMemo<StackNavigationOptions>(
		() => ({
			...TransitionPresets.SlideFromRightIOS,

			headerShown: false,
			safeAreaInsets: { top: 0 },
			cardStyle: {
				backgroundColor: 'white',
				overflow: 'visible',
			},
		}),
		[]
	);

	const screenAOptions = useMemo(() => ({ headerLeft: () => null }), []);
	return (
		<NavigationContainer >
			<Stack.Navigator screenOptions={screenOptions}>
				{isAppLoading ? (
					<Stack.Screen name="Splash" component={SplashScreen} />
				) : isUser ? (
					<>
						<Stack.Screen name="Login" component={LoginScreen} />
						<Stack.Screen name="Register" component={RegisterScreen} />
						<Stack.Screen name="Servers" component={DrawerNavigator} options={{ gestureEnabled: false }} />
					</>
				) : (
					<>
						<Stack.Screen name="Servers" component={DrawerNavigator} options={{ gestureEnabled: false }} />
						<Stack.Screen name="Profile" component={ProfileScreen} options={{ gestureEnabled: false }} />

					</>
				)}



			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default Navigation

const styles = StyleSheet.create({})