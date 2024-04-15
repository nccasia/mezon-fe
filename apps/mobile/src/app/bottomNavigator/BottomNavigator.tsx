import 'react-native-gesture-handler';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { View } from 'react-native';
import ServersScreen from '../screens/main/ServersScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import Notifications from '../screens/main/Notifications';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {

    return (
        <Tab.Navigator
            tabBarOptions={{
                style: {
                    height: 55,
                    borderTopWidth: 0,
                    elevation: 0,
                },
                showLabel: false,
                // activeTintColor: Colors.DEFAULT_GREEN,
            }}>
            <Tab.Screen
                name="Servers"
                component={ServersScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="home-work" color={color} size={28} />
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Feather name="message-circle" color={color} size={28} />
                    ),
                }}
            />
            <Tab.Screen
                name="Notification"
                component={Notifications}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Feather name="bell" color={color} size={28} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Feather name="user" color={color} size={28} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomNavigator;
