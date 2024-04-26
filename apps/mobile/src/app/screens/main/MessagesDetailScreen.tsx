import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { darkColor } from '../../constants/Colors'
import { HEIGHT, WIDTH } from '../../constants/config'

const MessagesDetailScreen = () => {
    return (
        <View style={{ backgroundColor: darkColor.Background_Secondary, width: WIDTH, height: HEIGHT }}>
            <Text>MessagesDetailScreen</Text>
        </View >
    )
}

export default MessagesDetailScreen

const styles = StyleSheet.create({})
