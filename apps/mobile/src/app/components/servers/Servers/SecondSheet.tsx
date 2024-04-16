import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { darkColor } from '../../../constants/Colors'
const { width } = Dimensions.get('window')
import Feather from 'react-native-vector-icons/Feather'

const SecondSheet = () => {
    return (
        <View style={styles.SecondSheetContainer}>
            <View style={styles.headerContainer}>
                <View style={styles.innerContainer}>
                    <Feather name="archive" size={20} />
                    <View style={{ flexDirection: 'row' }}>
                        <Feather name="Search" size={20} />
                        <View style={{ marginLeft: 20 }}>
                            <Feather name="User" size={20} />

                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default SecondSheet

const styles = StyleSheet.create({
    SecondSheetContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignSelf: 'flex-end',
        backgroundColor: darkColor.Backgound_Brand,
        transform: [{ translateX: width * 80 / 100 }]
    },
    headerContainer: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: darkColor.Backgound_Primary,
    },
    innerContainer: {
        width: '90%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})