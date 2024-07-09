import { HomeTab, MessageTab, NotiTab, ProfileTab } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { selectHiddenBottomTabMobile } from '@mezon/store-mobile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Notifications from '../../screens/Notifications';
import HomeScreen from '../../screens/home/HomeScreen';
import MessagesScreen from '../../screens/messages/MessagesScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import { APP_SCREEN } from '../ScreenTypes';

const TabStack = createBottomTabNavigator();

const BottomNavigator = () => {
	const hiddenBottomTab = useSelector(selectHiddenBottomTabMobile);
	const {themeValue} = useTheme();

	return (
		<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: themeValue.secondary }}>
			<TabStack.Navigator
				screenOptions={{
					tabBarHideOnKeyboard: true,
					tabBarStyle: {
						height: hiddenBottomTab ? 0 : 80,
						paddingBottom: hiddenBottomTab ? 10 : 20,
						borderTopWidth: hiddenBottomTab ? 0 : 1,
						elevation: 0,
						backgroundColor: themeValue.secondary,
						borderTopColor: themeValue.border,
					},
					tabBarActiveTintColor: themeValue.textStrong,
					tabBarInactiveTintColor: themeValue.textDisabled
				}}
				initialRouteName={APP_SCREEN.DRAWER_BAR}
			>
				<TabStack.Screen
					name={APP_SCREEN.HOME}
					component={HomeScreen}
					options={{
						headerShown: false,
						title: 'Servers',
						tabBarIcon: ({ color }) => (hiddenBottomTab ? <View /> : <HomeTab color={color} />),
					}}
				/>
				<TabStack.Screen
					name={APP_SCREEN.MESSAGES.HOME}
					component={MessagesScreen}
					options={{
						headerShown: false,
						title: 'Messages',
						tabBarIcon: ({ color }) => (hiddenBottomTab ? <View /> : <MessageTab color={color} />),
					}}
				/>
				<TabStack.Screen
					name={APP_SCREEN.NOTIFICATION.HOME}
					component={Notifications}
					options={{
						headerShown: false,
						title: 'Notifications',
						tabBarIcon: ({ color }) => (hiddenBottomTab ? <View /> : <NotiTab color={color} />),
					}}
				/>
				<TabStack.Screen
					name={APP_SCREEN.PROFILE.HOME}
					component={ProfileScreen}
					options={{
						headerShown: false,
						title: 'Profile',
						tabBarIcon: ({ color }) => (hiddenBottomTab ? <View /> : <ProfileTab color={color} />),
					}}
				/>
			</TabStack.Navigator>
		</SafeAreaView>
	);
};

export default BottomNavigator;
