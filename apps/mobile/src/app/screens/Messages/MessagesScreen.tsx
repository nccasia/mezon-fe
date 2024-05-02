import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import { darkColor } from '../../constants/Colors'
import { HEIGHT, WIDTH } from '../../constants/config'
import Chats from '../../../assets/Chats.json'
import moment from 'moment'
import { useNavigation } from '@react-navigation/native'
import { APP_SCREEN } from '../../navigation/ScreenTypes'
const MessagesScreen = () => {
    const navigation = useNavigation()
    const onDetail = () => {
        // Example for navigation detail screen
        navigation.push(APP_SCREEN.MESSAGES.STACK, {
            screen: APP_SCREEN.MESSAGES.IDMESSAGE,
        });
    };
    return (
        <View style={{ backgroundColor: darkColor.Background_Secondary, width: WIDTH, height: HEIGHT }}>
            {/* header */}
            <View style={{ height: 150, width: '100%', paddingBottom: 20 }}>
                {/* header */}
                <View style={{ width: '100%', height: '60%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 20, paddingRight: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>Messages</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '38%', backgroundColor: darkColor.Backgound_Tertiary, borderRadius: 40, gap: 5, height: '60%' }}>
                        <Feather name="user-plus" size={20} style={{ color: '#FFFFFF' }} />
                        <Text style={{ color: '#FFFFFF' }}>Add Friends</Text>
                    </TouchableOpacity>
                </View>
                {/* search */}
                <View style={{ height: '40%', width: "95%", backgroundColor: darkColor.Backgound_Primary, paddingLeft: 20, paddingRight: 10, alignItems: 'center', flexDirection: 'row', borderRadius: 30, marginLeft: 10 }}>
                    <Feather style={{ color: '#FFFFFF' }} name="search" size={20} />
                    <TextInput placeholder='Search' placeholderTextColor={"gray"} style={{ color: '#FFFFFF' }} />


                </View>
            </View>
            <ScrollView>
                <View style={{ backgroundColor: darkColor.Background_Secondary, width: '100%', height: 100 }}>
                    <ScrollView
                        horizontal
                        contentContainerStyle={{ alignItems: 'center', paddingLeft: 20, gap: 10 }}
                    >
                        <FlatList
                            data={Chats}
                            renderItem={({ item }) =>
                                <TouchableOpacity style={{ width: 100, height: 100, borderRadius: 20, backgroundColor: darkColor.Backgound_Tertiary, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={{ uri: item.img }} style={{ width: '60%', height: '60%', borderRadius: 50 }} />
                                    {item.online ?
                                        <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 10, backgroundColor: 'green', bottom: 18, right: 20, borderWidth: 2, borderColor: darkColor.Background_Secondary }} />
                                        :
                                        <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 10, backgroundColor: 'gray', bottom: 18, right: 20, borderWidth: 2, borderColor: darkColor.Background_Secondary }} />}
                                </TouchableOpacity>}
                            keyExtractor={(item) => item.id.toString()}
                            ItemSeparatorComponent={() => (
                                <View style={{ marginLeft: 10 }} />
                            )}
                            scrollEnabled={false}
                        />

                    </ScrollView>
                </View>
                {/* body */}
                <View style={{ width: '100%', paddingTop: 20, paddingLeft: 20, paddingRight: 20, gap: 10 }}>
                    <FlatList
                        data={Chats}
                        renderItem={({ item }) =>
                            <TouchableOpacity style={{ flexDirection: 'row', width: '100%', height: 60 }}
                                onPress={onDetail}>
                                <View style={{ width: 60, height: 60 }}>
                                    <Image source={{ uri: item.img }} style={{ width: "90%", height: '90%', borderRadius: 50 }} />
                                    {item.online ?
                                        <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 10, backgroundColor: 'green', bottom: 4, right: 6, borderWidth: 2, borderColor: darkColor.Background_Secondary }} />
                                        :
                                        <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 10, backgroundColor: 'gray', bottom: 4, right: 6, borderWidth: 2, borderColor: darkColor.Background_Secondary }} />}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontWeight: 800, color: '#FFFFFF' }}>{item.from}</Text>
                                        <Text style={{ color: '#FFFFFF' }}>{moment(item.date).format('MMM DD YYYY')}</Text>
                                    </View>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>
                                        {item.msg.length > 40 ? `${item.msg.substring(0, 30)}...` : item.msg}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        }
                        keyExtractor={(item) => item.id.toString()}
                        ItemSeparatorComponent={() => (
                            <View style={{ marginBottom: 13 }} />
                        )}
                        scrollEnabled={false}
                    />


                </View>

            </ScrollView>
            <View style={{ position: 'absolute', bottom: 100, right: 10, width: 60, height: 60, backgroundColor: darkColor.Foundation_Possitive, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="message-circle" size={30} />
            </View>
        </View >
    )
}

export default MessagesScreen

const styles = StyleSheet.create({})