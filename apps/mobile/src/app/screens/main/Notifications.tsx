import {Image, ScrollView, StyleSheet, Text, TextInput, Touchable, TouchableOpacity, View} from 'react-native'
import React from 'react'
import { darkColor } from '../../constants/Colors'
import { HEIGHT, WIDTH } from '../../constants/config'
import Feather from 'react-native-vector-icons/Feather'
import Images from 'apps/mobile/src/assets/Images'
import {useNavigation} from "@react-navigation/native";
import {APP_SCREEN} from "../../navigation/ScreenTypes";

const Notifications = () => {
    const navigation = useNavigation();
    
    const onDetail = () => {
        // Example for navigation detail screen
        navigation.push(APP_SCREEN.NOTIFICATION.STACK, {
            screen: APP_SCREEN.NOTIFICATION.DETAIL,
        });
    };

    return (
        <TouchableOpacity onPress={onDetail} style={{ backgroundColor: darkColor.Background_Secondary, width: WIDTH, height: HEIGHT }}>
            <View style={{ height: 80, width: '100%', paddingBottom: 20, flexDirection: 'row', alignItems: 'center', display: 'flex', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 10 }}>
                {/* header */}
                <Text style={{ fontSize: 18, fontWeight: 600 }}>Notifications</Text>
                <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: darkColor.Backgound_Tertiary, borderRadius: 50, height: 35, width: 35 }}>
                    <Feather name="more-horizontal" size={20} />
                </View>
            </View>
            <ScrollView >
                <View style={{ width: '100%', height: '100%', paddingLeft: 20, paddingRight: 20, gap: 10 }}>
                    <View style={{ flexDirection: 'row', width: '100%', height: 60 }}>
                        <View style={{ width: 60, height: 60 }}>
                            <Image source={Images.ANH} style={{ width: "90%", height: '90%', borderRadius: 50 }} />

                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontWeight: 800 }}>Name</Text>
                                <Text>9h</Text>
                            </View>
                            <Text>Name: oki oki oki</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </TouchableOpacity >
    )
}

export default Notifications

const styles = StyleSheet.create({})
