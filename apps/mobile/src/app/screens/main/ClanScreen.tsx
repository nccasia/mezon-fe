import { Dimensions, Image, StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import Images from 'apps/mobile/src/assets/Images'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { darkColor } from '../../constants/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'

const ClanScreen = () => {
    return (

        <SafeAreaView style={styles.secondSheetContainer}>

            {/* body */}
            <ScrollView style={styles.scrollViewContainer} nestedScrollEnabled={true}>
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>


                        </View>

                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>
                        </View>
                        <View style={{ width: 20, height: 20 }}>
                            <Pressable style={styles.iconBackgound}>
                                <Text>😊</Text>
                            </Pressable>

                        </View>
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>
                        </View>
                        <View style={{ width: 20, height: 20 }}>
                            <Pressable style={styles.iconBackgound}>
                                <Text>😊</Text>
                            </Pressable>

                        </View>
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>
                        </View>
                        <View style={{ width: 20, height: 20 }}>
                            <Pressable style={styles.iconBackgound}>
                                <Text>😊</Text>
                            </Pressable>

                        </View>
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>
                        </View>
                        <View style={{ width: 20, height: 20 }}>
                            <Pressable style={styles.iconBackgound}>
                                <Text>😊</Text>
                            </Pressable>

                        </View>
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>


                        </View>

                    </View>
                </View><View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>


                        </View>

                    </View>
                </View><View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>


                        </View>

                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>


                        </View>

                    </View>
                </View><View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>


                        </View>

                    </View>
                </View><View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <Image source={Images.DISCORDROUNDED} style={{ width: 50, height: 50, borderRadius: 50 }} />
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Hoai Son</Text>
                            <Text style={{ color: '#535353', fontSize: 12 }}>Yesterday at 3.00 pm</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#FFFFFF' }}>* Report daily</Text>


                        </View>

                    </View>
                </View>
            </ScrollView>
            <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 60, backgroundColor: darkColor.Background_Secondary, alignItems: 'center', flexDirection: 'row', gap: 12, paddingRight: 10, paddingLeft: 10 }}>
                <Pressable style={{ backgroundColor: darkColor.Backgound_Disabled, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}>
                    <Feather name="plus" size={30} style={{ color: darkColor.Content_Secondary }} />
                </Pressable>
                <Pressable style={{ backgroundColor: darkColor.Backgound_Disabled, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}>
                    <Feather name="grid" size={30} style={{ color: darkColor.Content_Secondary }} />
                </Pressable>
                <Pressable style={{ backgroundColor: darkColor.Backgound_Disabled, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}>
                    <Feather name="gift" size={30} style={{ color: darkColor.Content_Secondary }} />
                </Pressable>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', borderRadius: 50, backgroundColor: darkColor.Backgound_Disabled }}>
                    <TextInput style={{ flex: 1 }} />
                    <Pressable style={{ backgroundColor: darkColor.Backgound_Disabled, justifyContent: 'center', alignItems: 'center', borderRadius: 50, marginRight: 10 }}>
                        <MaterialIcons name="sentiment-satisfied-alt" size={30} style={{ color: darkColor.Content_Secondary }} />
                    </Pressable>
                </View>

                <Pressable style={{ backgroundColor: darkColor.Backgound_Disabled, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}>
                    <Feather name="mic" size={30} style={{ color: darkColor.Content_Secondary }} />
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

export default ClanScreen

const styles = StyleSheet.create({
    secondSheetContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: darkColor.Backgound_Primary,
    },
    headerContainer: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: darkColor.Backgound_Primary,
    },
    innerContainer: {
        width: '100%',
        height: 60,
        backgroundColor: darkColor.Background_Secondary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 8,
        alignItems: 'center',
    },
    scrollViewContainer: {
        flex: 1,
        paddingLeft: 8,
    },
    iconBackgound: {
        width: 30, height: 30, backgroundColor: '#535353', borderRadius: 8, justifyContent: 'center', alignItems: 'center'
    }
})