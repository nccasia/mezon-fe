import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { darkColor } from '../../constants/Colors'
import { HEIGHT, WIDTH } from '../../constants/config'

const NotificationsDetail = () => {
    return (
        <View style={{ backgroundColor: darkColor.Background_Secondary, width: WIDTH, height: HEIGHT }}>
            <Text>SCREEN EXAMPLE</Text>
            <Text>NotificationsDetail</Text>
        </View >
    )
}

export default NotificationsDetail

const styles = StyleSheet.create({})
