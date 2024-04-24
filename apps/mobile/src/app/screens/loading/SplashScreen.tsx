import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { HEIGHT, WIDTH } from '../../constants/config'
import Images from 'apps/mobile/src/assets/Images'
const SplashScreen = () => {
    return (
        <View style={{ width: WIDTH, height: HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={Images.ICON_GOOGLE} style={{ width: 100, height: 100 }} />
        </View>
    )
}

export default SplashScreen

const styles = StyleSheet.create({})