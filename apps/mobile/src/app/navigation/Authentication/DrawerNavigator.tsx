import { StyleSheet } from 'react-native'
import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HEIGHT } from '../../constants/config';
import MessagesScreen from '../../screens/main/MessagesScreen';
import ServersScreen from '../../screens/main/ClanScreen';
import { darkColor } from '../../constants/Colors';
import CustomDrawerContent from '../../components/ClanScreen/CustomDrawerContent';
import {APP_SCREEN} from "../ScreenTypes";
const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ navigation }) => {
    return (
        <Drawer.Navigator initialRouteName="Servers"
            drawerContent={props => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: darkColor.Backgound_Primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                drawerStyle: {
                    backgroundColor: '#c6cbef',
                    width: "90%",
                    height: HEIGHT,
                },
            }}>
            <Drawer.Screen
              name={APP_SCREEN.SERVERS.HOME}
              options={{
                headerShown: false
              }}
              component={ServersScreen}
            />
        </Drawer.Navigator>
    );
}

export default DrawerNavigator
