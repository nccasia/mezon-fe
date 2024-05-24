import { Colors } from '@mezon/mobile-ui';
import { selectHiddenBottomTabMobile } from '@mezon/store';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import HomeScreen from '../../screens/home/HomeScreen';
import MessagesScreen from '../../screens/messages/MessagesScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import { APP_SCREEN } from '../ScreenTypes';
import Notifications from '../../screens/Notifications';

const TabStack = createBottomTabNavigator();

const BottomNavigator = () => {
	const hiddenBottomTab = useSelector(selectHiddenBottomTabMobile);

	return (
		<TabStack.Navigator
			screenOptions={{
				tabBarHideOnKeyboard: true,
				tabBarStyle: {
					height: hiddenBottomTab ? 0 : 65,
					paddingBottom: 0,
					borderTopWidth: 0,
					elevation: 0,
					backgroundColor: Colors.secondary,
				},
				tabBarActiveTintColor: '#FFFFFF',
			}}
			initialRouteName={APP_SCREEN.DRAWER_BAR}
		>
			<TabStack.Screen
				name={APP_SCREEN.HOME}
				component={HomeScreen}
				options={{
					headerShown: false,
					title: 'Servers',
					tabBarIcon: ({ color }) => <MaterialIcons name="home-work" color={color} size={28} />,
				}}
			/>
			<TabStack.Screen
				name={APP_SCREEN.MESSAGES.HOME}
				component={MessagesScreen}
				options={{
					headerShown: false,
					title: 'Messages',
					tabBarIcon: ({ color }) => <Feather name="message-circle" color={color} size={28} />,
				}}
			/>
			<TabStack.Screen
				name={APP_SCREEN.NOTIFICATION.HOME}
				component={Notifications}
				options={{
					headerShown: false,
					title: 'Notifications',
					tabBarIcon: ({ color }) => <Feather name="bell" color={color} size={28} />,
				}}
			/>
			<TabStack.Screen
				name={APP_SCREEN.PROFILE.HOME}
				component={ProfileScreen}
				options={{
					headerShown: false,
					title: 'Profile',
					tabBarIcon: ({ color }) => <Feather name="user" color={color} size={28} />,
				}}
			/>
		</TabStack.Navigator>
	);
};

export default BottomNavigator;
