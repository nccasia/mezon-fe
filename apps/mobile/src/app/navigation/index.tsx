import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigator from './BottomNavigator';
import SplashScreen from '../screens/loading/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DrawerNavigator from './DrawerNavigator';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
const Stack = createStackNavigator()
const Navigation = () => {
	const [isUser, setIsUser] = useState(false)
	const [isAppLoading, setIsAppLoading] = useState(false)

	return (
		<NavigationContainer >
			<Stack.Navigator screenOptions={{ headerShown: false }}>
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