import 'react-native-gesture-handler';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { View } from 'react-native';
import ServersScreen from '../screens/main/ClanScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import Notifications from '../screens/main/Notifications';
import ProfileScreen from '../screens/main/ProfileScreen';
import { darkColor } from '../constants/Colors';
import { NavigationContainer } from '@react-navigation/native'

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarStyle: {
                        height: 55,
                        borderTopWidth: 0,
                        elevation: 0,
                        backgroundColor: darkColor.Backgound_Tertiary
                    },
                    tabBarActiveTintColor: "#FFFFFF"
                }}

            >
                <Tab.Screen
                    name="Servers"
                    component={ServersScreen}
                    options={
                        {
                            headerShown: false,
                            tabBarIcon: ({ color }) => (
                                <MaterialIcons name="home-work" color={color} size={28} />
                            ),
                        }}
                />
                <Tab.Screen
                    name="Messages"
                    component={MessagesScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Feather name="message-circle" color={color} size={28} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Notification"
                    component={Notifications}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Feather name="bell" color={color} size={28} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Feather name="user" color={color} size={28} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default BottomNavigator;
