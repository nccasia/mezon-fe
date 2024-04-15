import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Images from 'apps/mobile/src/assets/Images'
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import auth from '@react-native-firebase/auth';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
const GoogleLogin = () => {
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '285548761692-qciqfftsn1cv0kp31s6c9j6j1j1kluk1.apps.googleusercontent.com',
            iosClientId: "285548761692-evbblcupqf590p2jqissbdqucfcev6sv.apps.googleusercontent.com",
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
    }, [])
    const navigation = useNavigation()
    const signInWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log(userInfo);
            navigation.navigate('Servers')
        } catch (error) {
            console.log('Message', error.message);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress already');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available or outdated');
            } else {
                console.log('Some other error happened');
            }
        }
    };
    return (
        <Pressable style={styles.googleButton}
            onPress={signInWithGoogle}
        >
            <View style={styles.socialButtonsContainer}>
                <View style={styles.signinButtonLogoContainer}>
                    <Image source={Images.ICON_GOOGLE} style={styles.signinButtonLogo} />
                </View>
                <Text style={styles.socialSigninButtonText}>Continue with Google</Text>
            </View>
        </Pressable>
    )
}

export default GoogleLogin

const styles = StyleSheet.create({
    googleButton: {
        backgroundColor: "#D1E0FF",
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    signinButtonLogoContainer: {
        backgroundColor: "#155EEF",
        padding: 2,
        borderRadius: 3,
        position: 'absolute',
        left: 25,
    },
    signinButtonLogo: {
        height: 18,
        width: 18,
    },
    socialSigninButtonText: {
        color: "#155EEF",
        fontSize: 16,
        lineHeight: 13 * 1.4,
    },
})