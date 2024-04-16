import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import FirstSheet from '../../components/servers/Servers/FirstSheet';
import SecondSheet from '../../components/servers/Servers/SecondSheet';
import ThirdSheet from '../../components/servers/Servers/ThirdSheet';

const ServersScreen = () => {
    // const signOutWithGoogle = async () => {
    //     try {
    //         await GoogleSignin.revokeAccess();
    //         await GoogleSignin.signOut();
    //         console.log('Successfully signed out');
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };
    return (
        <View style={styles.container}>
            <FirstSheet />
            <SecondSheet />
            <ThirdSheet />
        </View>
    )
}

export default ServersScreen

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    }
})