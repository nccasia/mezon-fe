import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { HEIGHT, WIDTH } from '../../constants/config'
import { darkColor } from '../../constants/Colors'
import Feather from 'react-native-vector-icons/Feather'
import Images from 'apps/mobile/src/assets/Images'
const MessageID = () => {
    return (
        <SafeAreaView style={{ width: WIDTH, height: HEIGHT, backgroundColor: darkColor.Background_Secondary }}>
            <View style={{ flexDirection: 'row', height: 55, backgroundColor: darkColor.Backgound_Surface, alignItems: 'center', paddingLeft: 10, paddingRight: 10, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Feather name="arrow-left" size={30} style={{ color: 'white' }} />
                    <Image source={Images.ANH} style={{ borderRadius: 50, width: 30, height: 30 }} />
                    <Text style={{ color: '#FFFFFF' }}>thiet.nguyenba</Text>
                    <Feather name="chevron-right" size={15} style={{ color: 'white' }} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: darkColor.Background_Secondary, borderRadius: 50 }}>
                        <Feather name="phone" size={20} style={{ color: 'white', }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: darkColor.Background_Secondary, borderRadius: 50 }}>
                        <Feather name="video" size={20} style={{ color: 'white' }} />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView>

            </ScrollView>
        </SafeAreaView>
    )
}

export default MessageID

const styles = StyleSheet.create({})