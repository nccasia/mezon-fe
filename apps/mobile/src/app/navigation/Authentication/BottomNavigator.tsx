import 'react-native-gesture-handler';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import MessagesScreen from '../../screens/main/MessagesScreen';
import Notifications from '../../screens/main/Notifications';
import ProfileScreen from '../../screens/main/ProfileScreen';
import { darkColor } from '../../constants/Colors';
import {APP_SCREEN} from "../ScreenTypes";
import DrawerNavigator from "./DrawerNavigator";

const TabStack = createBottomTabNavigator();

const BottomNavigator = () => {

    return (
        <TabStack.Navigator
            screenOptions={{
                tabBarStyle: {
                    height: 65,
                    paddingBottom: 10,
                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: darkColor.Backgound_Tertiary
                },
                tabBarActiveTintColor: "#FFFFFF"
            }}
            initialRouteName={APP_SCREEN.DRAWER_BAR}
        >
            <TabStack.Screen
                name={APP_SCREEN.DRAWER_BAR}
                component={DrawerNavigator}
                options={{
                    headerShown: false,
                    title: 'Servers',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="home-work" color={color} size={28} />
                    ),
                }}
            />
            <TabStack.Screen
                name={APP_SCREEN.MESSAGES.HOME}
                component={MessagesScreen}
                options={{
                  headerShown: false,
                  title: 'Messages',
                    tabBarIcon: ({ color }) => (
                        <Feather name="message-circle" color={color} size={28} />
                    ),
                }}
            />
            <TabStack.Screen
                name={APP_SCREEN.NOTIFICATION.HOME}
                component={Notifications}
                options={{
                    headerShown: false,
                    title: 'Notifications',
                    tabBarIcon: ({ color }) => (
                        <Feather name="bell" color={color} size={28} />
                    ),
                }}
            />
            <TabStack.Screen
                name={APP_SCREEN.PROFILE.HOME}
                component={ProfileScreen}
                options={{
                    headerShown: false,
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <Feather name="user" color={color} size={28} />
                    ),
                }}
            />
        </TabStack.Navigator>
    );
};

export default BottomNavigator;
