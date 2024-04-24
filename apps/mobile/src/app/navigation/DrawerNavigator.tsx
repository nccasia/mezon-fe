import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { HEIGHT } from '../constants/config';
import MessagesScreen from '../screens/main/MessagesScreen';
import Feather from 'react-native-vector-icons/Feather'
import ServersScreen from '../screens/main/ClanScreen';
import { darkColor } from '../constants/Colors';
import CustomDrawerContent from '../components/ClanScreen/CustomDrawerContent';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ navigation }) => {

    return (
        <BottomSheetModalProvider>

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
                    headerRight: () => (

                        <View
                            style={{
                                width: '100%',
                                height: 50,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}
                        >
                            <View style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Feather size={20} name="chevron-right" style={{ color: '#FFFFFF' }} />
                            </View>
                            <View style={{ flexDirection: 'row', marginRight: 10 }}>
                                <TouchableOpacity style={{ borderRadius: 100, backgroundColor: '#323232', width: 35, height: 35, alignItems: 'center', justifyContent: 'center' }}>
                                    <Feather size={20} name="search" style={{ color: '#FFFFFF' }} />
                                </TouchableOpacity>

                            </View>
                        </View>
                    ),
                }}>

                <Drawer.Screen name="Servers"

                    component={ServersScreen} />
                <Drawer.Screen name="Messages" component={MessagesScreen} />


            </Drawer.Navigator>
        </BottomSheetModalProvider>

    );
}

export default DrawerNavigator

const styles = StyleSheet.create({})