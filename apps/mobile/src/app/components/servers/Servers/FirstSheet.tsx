import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { PanGestureHandler } from 'react-native-gesture-handler'
import serverNavbar from '../firstSheets/serverNavbar'
import serverDetail from '../firstSheets/serverDetail'
const FirstSheet = () => {
    return (
        <PanGestureHandler >
            <serverNavbar />
            <serverDetail />
        </PanGestureHandler>
    )
}

export default FirstSheet

const styles = StyleSheet.create({})