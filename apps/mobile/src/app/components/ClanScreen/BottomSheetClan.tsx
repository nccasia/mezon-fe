import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import {
    BottomSheetModal,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Feather from 'react-native-vector-icons/Feather'

import { useState } from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import Images from 'apps/mobile/src/assets/Images';
import { darkColor } from '../../constants/Colors';
const MenuName = [
    {
        id: 1,
        title: "Boost",
        icon: "sliders",

    },
    {
        id: 2,
        title: "Invite",
        icon: "user-plus",

    },
    {
        id: 3,
        title: "Notification",
        icon: "bell",

    },
    {
        id: 4,
        title: "Settings",
        icon: "settings",

    }
]
type MenuListItemProp = {
    id: number,
    title: string,
    icon: string
}
const MenuListName = ({ id, title, icon }: MenuListItemProp) => {
    return (
        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 60, height: 60, backgroundColor: darkColor.Backgound_Tertiary, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={icon} size={20} />
            </View>
            <Text style={{ fontSize: 12, marginTop: 5 }}>{title}</Text>
        </TouchableOpacity>

    )
}
const BottomSheetClan = ({ bottomSheetModalRef }) => {
    const [isEnabledChannels, setIsEnabledChannels] = useState(false);
    const [isEnabledMessage, setIsEnabledMessage] = useState(false);
    const [isEnabledRequest, setIsEnabledRequest] = useState(false);

    const toggleSwitchChannels = () => setIsEnabledChannels(previousState => !previousState);
    const toggleSwitchMessage = () => setIsEnabledMessage(previousState => !previousState);

    const toggleSwitchRequest = () => setIsEnabledRequest(previousState => !previousState);

    // variables
    const snapPoints = useMemo(() => ['50%', '90%'], []);

    // callbacks

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);
    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
        >
            <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
                <Image source={Images.ANH} style={{ width: '100%', height: 150 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 26 }}>May chu</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        <View style={{ width: 14, height: 14, borderRadius: 10, backgroundColor: 'green', bottom: 2, right: 0, borderWidth: 2, borderColor: darkColor.Background_Secondary }}></View>
                        <Text>1 Onlone</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        <View style={{ width: 14, height: 14, borderRadius: 10, backgroundColor: 'gray', bottom: 2, right: 0, borderWidth: 2, borderColor: darkColor.Background_Secondary }}></View>
                        <Text>3 Members</Text>
                    </View>

                </View>
                <View style={{ flexDirection: 'row', width: '100%', height: 120, justifyContent: 'space-between', alignItems: 'center' }}>
                    {MenuName.map((menuItem) => (
                        <MenuListName
                            key={menuItem.id}
                            id={menuItem.id}
                            title={menuItem.title}
                            icon={menuItem.icon}
                        />
                    ))}
                </View>
                <View style={{ height: 80, backgroundColor: darkColor.Backgound_Tertiary, borderRadius: 30, flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
                    <Text>Mark As Read</Text>
                </View>
                <TouchableOpacity style={{ height: 80, marginTop: 20, backgroundColor: darkColor.Backgound_Tertiary, borderRadius: 30, alignItems: 'center', flexDirection: 'row', paddingLeft: 10 }}>
                    <Text>Create Event</Text>
                </TouchableOpacity>
                <View style={{ marginTop: 20, backgroundColor: darkColor.Backgound_Tertiary, borderRadius: 30, paddingLeft: 20, alignItems: 'center', paddingRight: 20 }}>
                    <TouchableOpacity style={{ width: '100%', height: 70, backgroundColor: darkColor.Backgound_Tertiary, alignItems: 'center', flexDirection: 'row', borderRadius: 30 }}>
                        <Text>Edit Server Profile</Text>
                    </TouchableOpacity>
                    <View style={{ width: '100%', height: 1, backgroundColor: darkColor.Content_Subtle }}></View>
                    <View style={{ width: '100%', height: 70, backgroundColor: darkColor.Backgound_Tertiary, alignItems: 'center', flexDirection: 'row', borderRadius: 30, justifyContent: 'space-between' }}>
                        <Text>Hide Muted Channels</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: darkColor.Content_Brand }}
                            thumbColor={isEnabledChannels ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchChannels}
                            value={isEnabledChannels}
                            style={{}}
                        />
                    </View>
                    <View style={{ width: '100%', height: 1, backgroundColor: darkColor.Content_Subtle }}></View>
                    <View style={{ width: '100%', height: 70, backgroundColor: darkColor.Backgound_Tertiary, alignItems: 'center', flexDirection: 'row', borderRadius: 30, justifyContent: 'space-between' }}>
                        <Text>Allow Direct Messages</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: darkColor.Content_Brand }}
                            thumbColor={isEnabledMessage ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchMessage}
                            value={isEnabledMessage}
                            style={{}}
                        />
                    </View>
                    <View style={{ width: '100%', height: 1, backgroundColor: darkColor.Content_Subtle }}></View>
                    <View style={{ width: '100%', height: 70, backgroundColor: darkColor.Backgound_Tertiary, alignItems: 'center', flexDirection: 'row', borderRadius: 30, justifyContent: 'space-between' }}>
                        <Text>Allow Message Request</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: darkColor.Content_Brand }}
                            thumbColor={isEnabledRequest ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchRequest}
                            value={isEnabledRequest}
                            style={{}}
                        />
                    </View>
                    <View style={{ width: '100%', height: 1, backgroundColor: darkColor.Content_Subtle }}></View>
                    <TouchableOpacity style={{ width: '100%', height: 70, backgroundColor: darkColor.Backgound_Tertiary, alignItems: 'center', flexDirection: 'row', borderRadius: 30 }}>
                        <Text style={{ color: 'red' }}>Leave Server</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    )
}

export default BottomSheetClan

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        backgroundColor: darkColor.Background_Secondary,

    },
    scrollContainer: {
        backgroundColor: darkColor.Background_Secondary,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 30
    },
})