import { Dimensions, Image, StyleSheet, Text, View, ScrollView, Pressable, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import Images from 'apps/mobile/src/assets/Images'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { darkColor } from '../../constants/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRef } from 'react'
import { useCallback } from 'react'
import { useMemo } from 'react'
import { HEIGHT } from '../../constants/config'
import ImagePicker from 'react-native-image-crop-picker';
import { useState } from 'react'
import DocumentPicker from 'react-native-document-picker'
import Video from 'react-native-video';
const ClanScreen = () => {

    const [inputMessage, setInputMessage] = useState("")
    const handleInputText = (text) => {
        setInputMessage(text)
    }

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);


    //handle input message
    const submitHandle = () => {
        setInputMessage("")
    }
    // variables
    const snapPoints = useMemo(() => ['90%', '35%'], []);
    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);
    const [imageUri, setImageUri] = useState(null)
    const selectedImage = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            setImageUri(image.path)
        }).catch(err => {
            console.log("ImagePicker error", err);
        });
    }
    const [pickedFile, setPickedFile] = useState(null)
    const selectDoc = async () => {
        try {
            const doc = await DocumentPicker.pick({
                type: [
                    DocumentPicker.types.images,
                    DocumentPicker.types.video,
                    DocumentPicker.types.pdf
                ],
                allowMultiSelection: true
            })
            console.log(doc);

            setPickedFile(doc);

        } catch (error) {
            if (DocumentPicker.isCancel(error))
                console.log('User cancelled the upload', error);
            else {
                console.log(error);

            }
        }
    }
    const [pickedImage, setPickedImage] = useState(null);


    return (

        <SafeAreaView style={styles.secondSheetContainer}>

            {/* body */}
            <ScrollView style={styles.scrollViewContainer} nestedScrollEnabled={true}>
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
                {imageUri && (
                    <Image source={{ uri: imageUri }} style={styles.circulerImag} />
                )}
                {pickedImage && (
                    <Image
                        source={{ uri: pickedImage.uri }}
                        style={{ width: 200, height: 200, marginTop: 20 }}
                    />
                )}
                {pickedFile && (
                    <View style={{ marginTop: 20 }}>
                        {pickedFile.type === 'image/jpeg' && (
                            <Image
                                source={{ uri: pickedFile.uri }}
                                style={{ width: 200, height: 200 }}
                            />
                        )}
                        {pickedFile.type === 'video/mp4' && (
                            <Video
                                source={{ uri: `${pickedFile.uri} ` }}

                                style={{ width: 200, height: 200 }}
                                controls={true}
                            />
                        )}

                    </View>
                )}

            </ScrollView>

            <View style={{ position: 'absolute', bottom: 0, width: '100%', paddingTop: 10, paddingBottom: 10, backgroundColor: darkColor.Background_Secondary, }}>
                <View style={{ position: 'relative', alignItems: 'center', flexDirection: 'row', gap: 12, paddingRight: 10, paddingLeft: 10 }}>
                    <TouchableOpacity
                        onPress={handlePresentModalPress}
                        style={{ backgroundColor: darkColor.Backgound_Disabled, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}
                    >
                        <Feather name="plus" size={30} style={{ color: darkColor.Content_Secondary }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: darkColor.Backgound_Disabled, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}>
                        <Feather name="grid" size={30} style={{ color: darkColor.Content_Secondary }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: darkColor.Backgound_Disabled, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}>
                        <Feather name="gift" size={30} style={{ color: darkColor.Content_Secondary }} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', borderRadius: 50, backgroundColor: darkColor.Backgound_Disabled }}>
                        <TextInput style={{ flex: 1 }} value={inputMessage} onChangeText={handleInputText} />
                        <TouchableOpacity onPress={submitHandle} style={{ backgroundColor: darkColor.Backgound_Disabled, justifyContent: 'center', alignItems: 'center', borderRadius: 50, marginRight: 10 }}>
                            <MaterialIcons name="sentiment-satisfied-alt" size={30} style={{ color: darkColor.Content_Secondary }} />
                        </TouchableOpacity>

                    </View>
                    <TouchableOpacity style={{ backgroundColor: darkColor.Backgound_Disabled, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}>
                        <Feather name="mic" size={30} style={{ color: darkColor.Content_Secondary }} />
                    </TouchableOpacity>
                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                        style={{ zIndex: 0 }}
                    >
                        <BottomSheetView style={styles.contentContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={selectedImage} style={{ width: '49%', height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: darkColor.Backgound_Disabled, borderRadius: 30, gap: 10 }}>
                                    <Feather size={20} name="align-left" />
                                    <Text>Polls</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={selectDoc} style={{ width: '49%', height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: darkColor.Backgound_Disabled, borderRadius: 30, gap: 10 }}>
                                    <Feather size={20} name="paperclip" />
                                    <Text>Files</Text>
                                </TouchableOpacity>

                            </View>

                        </BottomSheetView>
                    </BottomSheetModal>

                </View>

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
    },
    contentContainer: {
        backgroundColor: darkColor.Background_Secondary,
        width: '100%',
        height: HEIGHT,
        paddingRight: 10,
        paddingLeft: 10
    },
    circulerImag: {
        width: 200,
        height: 200,
        borderRadius: 2,
        marginBottom: 20
    }
})