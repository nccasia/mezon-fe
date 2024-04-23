import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Images from 'apps/mobile/src/assets/Images'
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
const GoogleLogin = () => {

    GoogleSignin.configure({
        webClientId: "285548761692-i672579oq9k4b80np8bkjre6o8ikgl95.apps.googleusercontent.com",
    });

    const navigation = useNavigation()
    async function onGoogleButtonPress() {
        try {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the users ID token
            const { idToken } = await GoogleSignin.signIn();

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            auth().signInWithCredential(googleCredential);
            navigation.navigate('Servers')
        } catch (error) {

            console.log(JSON.stringify(error));

        }

    }
    return (
        <Pressable style={styles.googleButton}
            onPress={onGoogleButtonPress}
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