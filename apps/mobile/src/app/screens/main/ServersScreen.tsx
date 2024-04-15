import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const ServersScreen = () => {
    const signOutWithGoogle = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            console.log('Successfully signed out');
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <View>
            <Text>ServersScreen</Text>
        </View>
    )
}

export default ServersScreen

const styles = StyleSheet.create({})