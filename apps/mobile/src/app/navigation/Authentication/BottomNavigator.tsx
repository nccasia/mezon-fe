import { HomeTab, MessageTab, NotiTab, ProfileTab } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { selectHiddenBottomTabMobile } from '@mezon/store-mobile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigationState } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { Animated, LayoutAnimation, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import useTabletLandscape from '../../hooks/useTabletLandscape';
import Notifications from '../../screens/Notifications';
import HomeScreen from '../../screens/home/HomeScreen';
import MessagesScreen from '../../screens/messages/MessagesScreen';
import MessagesScreenTablet from '../../screens/messages/MessagesScreenTablet';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import { APP_SCREEN } from '../ScreenTypes';

const TabStack = createBottomTabNavigator();

const BottomNavigator = () => {
	const hiddenBottomTab = useSelector(selectHiddenBottomTabMobile);
	const { themeValue } = useTheme();
	const isTabletLandscape = useTabletLandscape();
	const tabBarTranslateY = useRef(new Animated.Value(0)).current;
	const isHomeActive = useNavigationState((state) => state?.routes?.[state?.index]?.state?.index === 0);

	useEffect(() => {
		LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types['easeInEaseOut'], LayoutAnimation.Properties['opacity']));
		Animated.timing(tabBarTranslateY, {
			toValue: hiddenBottomTab ? 80 : 0,
			duration: 200,
			useNativeDriver: true
		}).start();
	}, [hiddenBottomTab, tabBarTranslateY]);

	return (
		<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: isHomeActive ? themeValue.primary : themeValue.secondary }}>
			<TabStack.Navigator
				screenOptions={{
					tabBarHideOnKeyboard: true,
					tabBarStyle: {
						height: hiddenBottomTab ? 0 : 80,
						transform: [{ translateY: tabBarTranslateY }],
						paddingBottom: hiddenBottomTab ? 0 : 20,
						borderTopWidth: hiddenBottomTab ? 0 : 1,
						elevation: 0,
						backgroundColor: themeValue.secondary,
						borderTopColor: themeValue.border
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
						title: 'Clans',
						tabBarIcon: ({ color }) => (hiddenBottomTab ? <View /> : <HomeTab color={color} width={size.s_22} height={size.s_22} />)
					}}
				/>
				<TabStack.Screen
					name={APP_SCREEN.MESSAGES.HOME}
					component={isTabletLandscape ? MessagesScreenTablet : MessagesScreen}
					options={{
						headerShown: false,
						title: 'Messages',
						tabBarIcon: ({ color }) => (hiddenBottomTab ? <View /> : <MessageTab color={color} width={size.s_22} height={size.s_22} />)
					}}
				/>
				<TabStack.Screen
					name={APP_SCREEN.NOTIFICATION.HOME}
					component={Notifications}
					options={{
						headerShown: false,
						title: 'Notifications',
						tabBarIcon: ({ color }) => (hiddenBottomTab ? <View /> : <NotiTab color={color} width={size.s_22} height={size.s_22} />)
					}}
				/>
				<TabStack.Screen
					name={APP_SCREEN.PROFILE.HOME}
					component={ProfileScreen}
					options={{
						headerShown: false,
						title: 'Profile',
						tabBarIcon: ({ color }) => (hiddenBottomTab ? <View /> : <ProfileTab color={color} width={size.s_22} height={size.s_22} />)
					}}
				/>
			</TabStack.Navigator>
		</SafeAreaView>
	);
};

export default BottomNavigator;
