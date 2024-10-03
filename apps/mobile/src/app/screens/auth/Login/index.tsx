import { appleAuth } from '@invertase/react-native-apple-authentication';
import { useAuth } from '@mezon/core';
import { Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { RootState } from '@mezon/store-mobile';
import { GoogleOneTapSignIn } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import LoadingModal from '../../../components/LoadingModal/LoadingModal';
import Button from '../../../components/auth/Button';
import { FooterAuth } from '../../../components/auth/FooterAuth';
import { LoginSocial } from '../../../components/auth/LoginSocial';
import { TextInputUser } from '../../../components/auth/TextInput';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { style } from './styles';
const LoginSchema = Yup.object().shape({
	email: Yup.string().email('Invalid email').required('Please enter your email'),
	password: Yup.string().min(8, 'Confirm password must be 8 characters long.').required('Please enter your password')
});

type LoginFormPayload = {
	email: string;
	password: string;
};
const WEB_CLIENT_ID = '285548761692-l9bdt00br2jg1fgh4c23dlb9rvkvqqs0.apps.googleusercontent.com';
const IOS_CLIENT_ID = '285548761692-3k9ubkdhl8bbvbal78j9v2905kjhg3tj.apps.googleusercontent.com';

const LoginScreen = () => {
	const styles = style(useTheme().themeValue);
	const navigation = useNavigation();
	const isLoading = useSelector((state: RootState) => state.auth.loadingStatus);
	const { loginByGoogle, loginByApple, loginEmail } = useAuth();

	useEffect(() => {
		// const config = {
		// 	webClientId: (process.env.NX_CHAT_APP_GOOGLE_CLIENT_ID as string) || WEB_CLIENT_ID,
		// 	iosClientId: (process.env.NX_IOS_APP_GOOGLE_CLIENT_ID as string) || IOS_CLIENT_ID,
		// 	offlineAccess: true,
		// 	forceCodeForRefreshToken: true,
		// };
		// GoogleSignin.configure(config);
	}, []);

	const handleSubmit = React.useCallback(
		async (values: LoginFormPayload) => {
			try {
				const res = await loginEmail(values.email, values.password, true);
				if (res === 'Invalid session') {
					if (Platform.OS === 'android') {
						Toast.show({
							type: 'error',
							text1: 'Login Failed',
							text2: 'Invalid email or password'
						});
					}
				}
			} catch (error) {
				/* empty */
			}
		},
		[loginEmail]
	);

	async function onGoogleButtonPress() {
		try {
			// Cheat fake request
			// fetch('https://5f831a256b97440016f4e334.mockapi.io/api/post');

			// await GoogleSignin.hasPlayServices();
			// const { idToken } = await GoogleSignin.signIn();
			// 648946579638-331cst20cdecpef6ov0o0qauupfhq41n.apps.googleusercontent.com
			// (process.env.NX_CHAT_APP_GOOGLE_CLIENT_ID as string) || WEB_CLIENT_ID,
			const { idToken } = await GoogleOneTapSignIn.presentExplicitSignIn({
				webClientId: (process.env.NX_CHAT_APP_GOOGLE_CLIENT_ID as string) || WEB_CLIENT_ID,
				iosClientId: (process.env.NX_IOS_APP_GOOGLE_CLIENT_ID as string) || IOS_CLIENT_ID
			});
			await loginByGoogle(idToken);
		} catch (error) {
			if (error.message !== 'Sign in action cancelled' && error.code != -5 && error.code != 12501) {
				Toast.show({
					type: 'error',
					text1: 'Login Failed',
					text2: error.message
				});
			}
		}
	}

	async function onAppleButtonPress() {
		try {
			const appleAuthRequestResponse = await appleAuth.performRequest({
				requestedOperation: appleAuth.Operation.LOGIN,
				requestedScopes: [appleAuth.Scope.EMAIL]
			});
			const identityToken = appleAuthRequestResponse?.identityToken;
			await loginByApple(identityToken);
		} catch (error) {
			if (error.code === appleAuth.Error.CANCELED) {
				return;
			}
			Toast.show({
				type: 'error',
				text1: 'Login Failed',
				text2: error.message
			});
		}
	}

	return (
		<SafeAreaView style={styles.supperContainer}>
			<KeyboardAvoidingView style={styles.container}>
				{/* header */}
				<View style={styles.headerContainer}>
					<Text style={styles.headerTitle}>WELCOME BACK</Text>
					<Text style={styles.headerContent}>So glad to meet you again!</Text>
				</View>
				{/* body */}
				<View style={styles.googleButton}>
					<LoginSocial onGoogleButtonPress={onGoogleButtonPress} onAppleButtonPress={onAppleButtonPress} />
					<Block marginTop={size.s_30} flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'} alignSelf={'center'}>
						<Block width={'35%'} height={1} backgroundColor={Colors.gray48} />
						<Text style={styles.orText}>Or</Text>
						<Block width={'35%'} height={1} backgroundColor={Colors.gray48} />
					</Block>
				</View>
				<ScrollView style={{ flex: 1 }}>
					<Formik
						initialValues={{
							email: '',
							password: ''
						}}
						validationSchema={LoginSchema}
						onSubmit={handleSubmit}
					>
						{({ errors, touched, values, handleSubmit, handleChange, setFieldTouched, isValid }) => (
							<>
								{/* email */}
								<TextInputUser
									label="Email or phone"
									value={values.email}
									onChangeText={handleChange('email')}
									placeholder="Email or phone"
									onBlur={() => setFieldTouched('email')}
									touched={touched.email}
									error={errors.email}
									isPass={false}
								/>

								{/* password */}
								<TextInputUser
									label="Password"
									value={values.password}
									onChangeText={handleChange('password')}
									placeholder="Password"
									onBlur={() => setFieldTouched('password')}
									touched={touched.password}
									error={errors.password}
									isPass={true}
								/>
								{/* button  */}
								<Button disabled={!isValid} onPress={handleSubmit} isValid={isValid} title={'Sign in'} />
							</>
						)}
					</Formik>
				</ScrollView>

				<FooterAuth content={'Need an account?'} onPress={() => navigation.navigate(APP_SCREEN.REGISTER as never)} title={'Register'} />
				<LoadingModal isVisible={isLoading === 'loading'} />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default LoginScreen;
