import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { PanGestureHandler } from 'react-native-gesture-handler'
import { darkColor } from '../../../constants/Colors'
import ServerNavbar from '../firstSheets/serverNavbar'
import ServerDetail from '../firstSheets/serverDetail'
const FirstSheet = () => {
    return (
        <View style={styles.firstSheetContainer}>
            <ServerNavbar />
            <ServerDetail />
        </View>
    )
}

export default FirstSheet

const styles = StyleSheet.create({
    firstSheetContainer: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        backgroundColor: darkColor.Backgound_BrandLight
    }
})