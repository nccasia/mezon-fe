import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ServersScreen from './screens/main/ServersScreen';
import Notifications from './screens/main/Notifications';
import MessagesScreen from './screens/main/MessagesScreen';
import SplashScreen from './screens/loading/SplashScreen';
import BottomNavigator from './bottomNavigator/BottomNavigator';
const Stack = createStackNavigator()
const App = () => {
	const [isUser, setIsUser] = useState(false)
	const [isAppLoading, setIsAppLoading] = useState(false)
	return (
		<NavigationContainer >
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{isAppLoading ? (
					<Stack.Screen name="Splash" component={SplashScreen} />
				) : !isUser ? (
					<>
						<Stack.Screen name="Login" component={LoginScreen} />
						<Stack.Screen name="Register" component={RegisterScreen} /></>
				) : (
					<>
						<Stack.Screen name="Servers" component={BottomNavigator} options={{ gestureEnabled: false }} />
					</>
				)}



			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default App

const styles = StyleSheet.create({})