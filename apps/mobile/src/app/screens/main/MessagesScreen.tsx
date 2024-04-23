import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import { darkColor } from '../../constants/Colors'
import { HEIGHT, WIDTH } from '../../constants/config'
import Images from 'apps/mobile/src/assets/Images'

const MessagesScreen = () => {
    return (
        <View style={{ backgroundColor: darkColor.Background_Secondary, width: WIDTH, height: HEIGHT }}>
            {/* header */}
            <View style={{ height: 150, width: '100%', paddingBottom: 20 }}>
                {/* header */}
                <View style={{ width: '100%', height: '60%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 20, paddingRight: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 600 }}>Messages</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '38%', backgroundColor: darkColor.Backgound_Tertiary, borderRadius: 40, gap: 5, height: '60%' }}>
                        <Feather name="user-plus" size={20} />
                        <Text>Add Friends</Text>
                    </View>
                </View>
                {/* search */}
                <View style={{ height: '40%', width: "95%", backgroundColor: darkColor.Backgound_Primary, paddingLeft: 20, paddingRight: 10, alignItems: 'center', flexDirection: 'row', borderRadius: 30, marginLeft: 10 }}>
                    <Feather name="search" size={20} />
                    <TextInput placeholder='Search' />


                </View>
            </View>
            <ScrollView>
                <View style={{ backgroundColor: darkColor.Background_Secondary, width: '100%', height: 100 }}>
                    <ScrollView
                        horizontal
                        contentContainerStyle={{ alignItems: 'center', paddingLeft: 20, gap: 10 }}
                        showsHorizontalScrollIndicator={false}
                    >
                        <View style={{ width: 100, height: 100, borderRadius: 20, backgroundColor: darkColor.Backgound_Tertiary, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={Images.ANH} style={{ width: '60%', height: '60%', borderRadius: 50 }} />
                            <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 10, backgroundColor: 'green', bottom: 18, right: 20, borderWidth: 2, borderColor: darkColor.Background_Secondary }}></View>
                        </View>
                        <View style={{ width: 100, height: 100, borderRadius: 20, backgroundColor: darkColor.Backgound_Tertiary, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={Images.ANH} style={{ width: '60%', height: '60%', borderRadius: 50 }} />
                            <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 10, backgroundColor: 'gray', bottom: 18, right: 20, borderWidth: 2, borderColor: darkColor.Background_Secondary }}></View>
                        </View>

                    </ScrollView>
                </View>
                {/* body */}
                <View style={{ width: '100%', paddingTop: 20, paddingLeft: 20, paddingRight: 20, gap: 10 }}>
                    <View style={{ flexDirection: 'row', width: '100%', height: 60 }}>
                        <View style={{ width: 60, height: 60 }}>
                            <Image source={Images.ANH} style={{ width: "90%", height: '90%', borderRadius: 50 }} />
                            <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 10, backgroundColor: 'green', bottom: 4, right: 6, borderWidth: 2, borderColor: darkColor.Background_Secondary }}></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontWeight: 800 }}>Name</Text>
                                <Text>9h</Text>
                            </View>
                            <Text>Name: oki oki oki</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', height: 60 }}>
                        <View style={{ width: 60, height: 60 }}>
                            <Image source={Images.ANH} style={{ width: "90%", height: '90%', borderRadius: 50 }} />
                            <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 10, backgroundColor: 'green', bottom: 4, right: 6, borderWidth: 2, borderColor: darkColor.Background_Secondary }}></View>
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
            <View style={{ position: 'absolute', bottom: 120, right: 10, width: 60, height: 60, backgroundColor: darkColor.Foundation_Possitive, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="message-circle" size={30} />
            </View>
        </View >
    )
}

export default MessagesScreen

const styles = StyleSheet.create({})