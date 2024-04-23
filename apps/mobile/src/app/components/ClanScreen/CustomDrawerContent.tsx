import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, TextInput } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import { useNavigation } from '@react-navigation/native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { HEIGHT, WIDTH } from '../../constants/config';
import Images from 'apps/mobile/src/assets/Images';
import { darkColor } from '../../constants/Colors';
import { useRef } from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useState } from 'react';
import BottomSheetClan from './BottomSheetClan';
const social = [
    {
        id: 1,
        title: "Share Invite",
        icon: "upload",

    },
    {
        id: 2,
        title: "Copy Link",
        icon: "link",

    },
    {
        id: 3,
        title: "Messages",
        icon: "message-circle",

    },
    {
        id: 4,
        title: "Email",
        icon: "settings",

    }
    , {
        id: 5,
        title: "Messager",
        icon: "settings",

    }, {
        id: 6,
        title: "Gmail",
        icon: "settings",

    }
]
type SocialListProp = {
    id: number,
    title: string,
    icon: string
}
const SocialList = ({ id, title, icon }: SocialListProp) => {
    return (
        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 60, height: 60, backgroundColor: darkColor.Backgound_Tertiary, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={icon} size={20} />
            </View>
            <Text style={{ fontSize: 12, marginTop: 5 }}>{title}</Text>
        </TouchableOpacity>

    )
}
const CustomDrawerContent = (props) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const navigation = useNavigation();
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);


    // variables
    const snapPoints = useMemo(() => ['50%', '90%'], []);

    // callbacks
    const handlePresentModalFriendPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    return (
        <DrawerContentScrollView {...props} >

            <View style={{ flexDirection: 'row', height: HEIGHT, backgroundColor: darkColor.Backgound_Disabled }}>
                <View style={styles.sideBar}>
                    {/* sidebar */}
                    <View style={styles.serverNavbarContainer}>
                        <ScrollView>
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.commonIconStyle}>
                                <Text style={{ color: darkColor.Content_Subtle }}>1st</Text>
                            </TouchableOpacity>
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
                        </ScrollView>
                    </View>

                </View>
                <View style={{ flex: 1, borderTopLeftRadius: 10 }}>
                    {/* header */}
                    <Image source={Images.ANH} style={{ width: "100%", height: 120, borderTopLeftRadius: 20, }} />
                    <View style={{ marginTop: 10, paddingLeft: 10, marginBottom: 10, marginRight: 10 }}>
                        <TouchableOpacity onPress={handlePresentModalPress}>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>KOMU</Text>
                                <Feather size={18} name="chevron-right" style={{ color: '#FFFFFF' }} />
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={{ color: darkColor.Content_Tertiary, fontSize: 13 }}>300 member</Text>
                                <Text style={{ color: darkColor.Content_Tertiary, fontSize: 13 }}>Community</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <TouchableOpacity style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 50, backgroundColor: darkColor.Border_Focus, gap: 5 }}>
                                <Feather size={20} name="search" style={{ color: darkColor.Backgound_Subtle }} />
                                <Text style={{ color: darkColor.Backgound_Subtle }}>Search</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePresentModalFriendPress} style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', borderRadius: 50, backgroundColor: darkColor.Border_Focus, width: 30, height: 30 }}>
                                <Feather size={20} name="user-plus" style={{ color: darkColor.Backgound_Subtle }} />
                            </TouchableOpacity>
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
                <BottomSheetClan bottomSheetModalRef={bottomSheetModalRef} />
                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                >
                    <BottomSheetView style={styles.contentContainer}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Invite a friend</Text>
                        </View>
                        <View style={{ width: '100%', height: 120 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 10 }}
                            >
                                {social.map((socialItem) => (
                                    <SocialList
                                        key={socialItem.id}
                                        id={socialItem.id}
                                        title={socialItem.title}
                                        icon={socialItem.icon}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                        <View style={{ width: '100%', height: 1, backgroundColor: darkColor.Content_Subtle }} />
                        <View style={{ width: '100%', height: 50, flexDirection: 'row', marginTop: 20, backgroundColor: darkColor.Backgound_Primary, borderRadius: 20, alignItems: 'center', paddingLeft: 20, gap: 10 }}>
                            <Feather name="search" size={20} />
                            <TextInput style={{ width: '90%', height: 50, backgroundColor: darkColor.Backgound_Primary, borderRadius: 30 }} placeholder="Invite friends to ..." />
                        </View>
                        <Text style={{ fontSize: 10, marginTop: 8 }}>Your invite link expires in 7 days. <Text style={{ color: darkColor.Content_BrandLight }}>Edit invite link</Text></Text>
                        <View style={{ width: "100%", marginTop: 20 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Friends</Text>
                            <View style={{ width: '100%', borderRadius: 20, backgroundColor: darkColor.Backgound_Tertiary }}>
                                <ScrollView>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 60, paddingLeft: 10, gap: 5, paddingRight: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Image source={Images.ANH} style={{ width: 38, height: 38, borderRadius: 50 }} />
                                            <Text>son.nguyenhoai1</Text>
                                        </View>
                                        <TouchableOpacity style={{ width: 80, height: 38, backgroundColor: darkColor.Backgound_Disabled, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text>Invite</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </BottomSheetView>
                </BottomSheetModal>
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
    contentContainer: {
        flex: 1,
        backgroundColor: darkColor.Background_Secondary,
        height: '100%',
        paddingLeft: 10,
        paddingRight: 10
    }
})