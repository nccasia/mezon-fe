import { useAuth } from '@mezon/core';
import { useAppDispatch } from '@mezon/store-mobile';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// eslint-disable-next-line @nx/enforce-module-boundaries
import Images from 'apps/mobile/src/assets/Images';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
const GoogleLogin = () => {
	const dispatch = useAppDispatch();
	const { loginByGoogle } = useAuth();

	useEffect(() => {
		const config = {
			webClientId: process.env.NX_CHAT_APP_GOOGLE_CLIENT_ID as string,
			iosClientId: process.env.NX_IOS_APP_GOOGLE_CLIENT_ID as string,
			offlineAccess: true,
			forceCodeForRefreshToken: true,
		};
		GoogleSignin.configure(config);
	}, []);

	async function onGoogleButtonPress() {
		try {
			// Cheat fake request
			// fetch('https://5f831a256b97440016f4e334.mockapi.io/api/post');

			await GoogleSignin.hasPlayServices();
			const { idToken } = await GoogleSignin.signIn();
			await loginByGoogle(idToken);
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Login Failed',
				text2: 'Unable to login with Google',
			});
		}
	}
	return (
		<TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
			<View style={styles.socialButtonsContainer}>
				<Image source={Images.ICON_GOOGLE} style={styles.signinButtonLogo} />
				<Text style={styles.socialSigninButtonText}>Continue with Google</Text>
			</View>
		</TouchableOpacity>
	);
};

export default GoogleLogin;

const styles = StyleSheet.create({
	googleButton: {
		backgroundColor: '#f3f6fc',
		paddingVertical: 15,
		marginHorizontal: 20,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
	},
	socialButtonsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		gap: 10,
	},
	signinButtonLogoContainer: {
		backgroundColor: '#155EEF',
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
		color: '#155EEF',
		fontSize: 16,
		lineHeight: 13 * 1.4,
	},
});
