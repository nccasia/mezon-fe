import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import { useNavigation } from '@react-navigation/native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { HEIGHT } from '../../constants/config';
import Images from 'apps/mobile/src/assets/Images';
import { darkColor } from '../../constants/Colors';

const CustomDrawerContent = (props) => {
    const navigation = useNavigation();
    return (
        <DrawerContentScrollView {...props} >

            <View style={{ flexDirection: 'row', height: HEIGHT, backgroundColor: darkColor.Backgound_Disabled }}>
                <View style={styles.sideBar}>
                    {/* Your sidebar content */}
                    <View style={styles.serverNavbarContainer}>
                        {/* here will be the list of servers */}
                        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.commonIconStyle}>
                            <Text style={{ color: darkColor.Content_Subtle }}>1st</Text>
                        </Pressable>
                        <View style={styles.commonIconStyle}>
                            <Text style={{ color: darkColor.Content_Subtle }}>2nd</Text>
                        </View>
                        <View style={styles.commonIconStyle}>
                            <Text style={{ color: darkColor.Content_Subtle }}>3nd</Text>
                        </View>
                        <View style={styles.commonIconStyle}>
                            <Feather name="plus" size={28} style={{ color: darkColor.Foundation_Possitive }} />
                        </View>
                        <View style={styles.commonIconStyle}>
                            <Feather name="git-branch" size={28} style={{ color: darkColor.Foundation_Possitive }} />
                        </View>
                    </View>
                    {/* Drawer items */}
                </View>
                <View style={{ flex: 1, borderTopLeftRadius: 10 }}>
                    <Image source={Images.ANH} style={{ width: "100%", height: 120, borderTopLeftRadius: 20, }} />
                    <View style={{ marginTop: 10, paddingLeft: 10, marginBottom: 10, marginRight: 10 }}>
                        <Pressable>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>KOMU</Text>
                                <Feather size={18} name="chevron-right" style={{ color: '#FFFFFF' }} />
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={{ color: darkColor.Content_Tertiary, fontSize: 13 }}>300 member</Text>
                                <Text style={{ color: darkColor.Content_Tertiary, fontSize: 13 }}>Community</Text>
                            </View>
                        </Pressable>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <Pressable style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 50, backgroundColor: darkColor.Border_Focus, gap: 5 }}>
                                <Feather size={20} name="search" style={{ color: darkColor.Backgound_Subtle }} />
                                <Text style={{ color: darkColor.Backgound_Subtle }}>Search</Text>
                            </Pressable>
                            <View style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', borderRadius: 50, backgroundColor: darkColor.Border_Focus, width: 30, height: 30 }}>
                                <Feather size={20} name="user-plus" style={{ color: darkColor.Backgound_Subtle }} />
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', borderRadius: 50, backgroundColor: darkColor.Border_Focus, width: 30, height: 30 }}>
                                <Feather size={20} name="calendar" style={{ color: darkColor.Backgound_Subtle }} />
                            </View>
                        </View>
                        <View style={{ width: '100%', backgroundColor: darkColor.Border_Focus, height: 1, marginTop: 12, marginBottom: 12 }} />
                        <>
                            <ScrollView>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Feather name="align-justify" size={23} style={{ color: darkColor.Backgound_Subtle }} />
                                    <Text style={{ color: darkColor.Backgound_Subtle }}>Browse Channels</Text>
                                </View>
                                <View style={{ width: '100%', backgroundColor: darkColor.Border_Focus, height: 1, marginTop: 12, marginBottom: 12 }} />
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <Feather name="chevron-down" style={{ color: darkColor.Backgound_Subtle }} />
                                    <Text style={{ color: darkColor.Backgound_Subtle }}>METTING ROOM</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <Feather name="chevron-right" style={{ color: darkColor.Backgound_Subtle }} />
                                    <Text style={{ color: darkColor.Backgound_Subtle }}>Kênh đàm thoại</Text>
                                </View>

                            </ScrollView>

                        </>
                    </View>
                    <DrawerItemList {...props} />
                </View>
            </View>

        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent

const styles = StyleSheet.create({
    sideBar: {
        width: '20%',
        backgroundColor: darkColor.Backgound_Primary

    },
    serverNavbarContainer: {
        alignSelf: "flex-end",
        alignItems: "center",
        width: '100%',
        paddingTop: 10, // Adjust as needed
    },
    commonIconStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: darkColor.Backgound_Tertiary,
        height: 50,
        width: 50,
        borderRadius: 100,
        marginBottom: 10,
    },
})
