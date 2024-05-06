import { useAuth } from '@mezon/core';
import { useAppDispatch } from '@mezon/store-mobile';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// eslint-disable-next-line @nx/enforce-module-boundaries
import Images from 'apps/mobile/src/assets/Images';
import React, { useEffect } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
const GoogleLogin = () => {
	const GOOGLE_WEB_ID = '648946579638-331cst20cdecpef6ov0o0qauupfhq41n.apps.googleusercontent.com';
	const dispatch = useAppDispatch();
	const { loginByGoogle } = useAuth();

	useEffect(() => {
		GoogleSignin.configure({
			webClientId: GOOGLE_WEB_ID,
			offlineAccess: true,
			forceCodeForRefreshToken: true,
		});
	}, []);
	async function onGoogleButtonPress() {
		try {
			await GoogleSignin.hasPlayServices();
			const { idToken } = await GoogleSignin.signIn();
			await loginByGoogle(idToken);
		} catch (error) {
			console.log('error onGoogleButtonPress', error);
			Alert.alert('Login Failed', 'Unable to login with Google');
		}
	}
	return (
		<Pressable style={styles.googleButton} onPress={onGoogleButtonPress}>
			<View style={styles.socialButtonsContainer}>
				<View style={styles.signinButtonLogoContainer}>
					<Image source={Images.ICON_GOOGLE} style={styles.signinButtonLogo} />
				</View>
				<Text style={styles.socialSigninButtonText}>Continue with Google</Text>
			</View>
		</Pressable>
	);
};

export default GoogleLogin;

const styles = StyleSheet.create({
	googleButton: {
		backgroundColor: '#D1E0FF',
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
