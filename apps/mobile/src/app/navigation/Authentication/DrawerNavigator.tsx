import { StyleSheet } from 'react-native'
import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HEIGHT } from '../../constants/config';
import MessagesScreen from '../../screens/main/MessagesScreen';
import ClanScreen from '../../screens/main/ClanScreen';
import { darkColor } from '../../constants/Colors';
import {APP_SCREEN} from "../ScreenTypes";
import DrawerClan from "../../screens/main/DrawerServices";
const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ navigation }) => {
    return (
        <Drawer.Navigator
            drawerContent={props => <DrawerClan {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: darkColor.Backgound_Primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                drawerStyle: {
                    width: "90%",
                },
            }}>
          <Drawer.Screen
            name={APP_SCREEN.SERVERS.REDIRECT}
            options={{
              headerShown: false,
            }}
            component={ClanScreen}
          />
        </Drawer.Navigator>
    );
}

export default DrawerNavigator
