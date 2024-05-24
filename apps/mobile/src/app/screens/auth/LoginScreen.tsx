import { useAuth } from '@mezon/core';
import { Colors, size } from '@mezon/mobile-ui';
import { RootState } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import LoadingModal from '../../components/LoadingModal';
import Button from '../../components/auth/Button';
import FooterAuth from '../../components/auth/FooterAuth';
import GoogleLogin from '../../components/auth/GoogleLogin';
import TextInputUser from '../../components/auth/TextInput';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
const LoginSchema = Yup.object().shape({
	email: Yup.string().email('Invalid email').required('Please enter your email'),
	password: Yup.string().min(8, 'Confirm password must be 8 characters long.').required('Please enter your password'),
});

type LoginFormPayload = {
	email: string;
	password: string;
};

const LoginScreen = () => {
	const navigation = useNavigation();
	const isLoading = useSelector((state: RootState) => state.auth.loadingStatus);
	const { loginEmail } = useAuth();

	const handleSubmit = React.useCallback(
		async (values: LoginFormPayload) => {
			try {
				const res = await loginEmail(values.email, values.password, true);
				if (res === 'Invalid session') {
					Toast.show({
						type: 'error',
						text1: 'User account not found',
					});
				}
			} catch (error) {
				/* empty */
			}
		},
		[loginEmail],
	);
	return (
		<KeyboardAvoidingView style={styles.container}>
			{/* header */}
			<View style={styles.headerContainer}>
				<Text style={styles.headerTitle}>WELCOME BACK</Text>
				<Text style={styles.headerContent}>So glad to meet you again!</Text>
			</View>
			<View style={styles.googleButton}>
				<GoogleLogin />
			</View>
			<Text style={styles.orText}>Or</Text>
			{/* body */}
			<ScrollView style={{ flex: 1 }}>
				<Formik
					initialValues={{
						email: '',
						password: '',
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
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	InputText: {
		fontSize: 18,
		textAlignVertical: 'center',
		padding: 0,
		color: '#FFFFFF',
		flex: 1,
	},
	container: {
		flex: 1,
		backgroundColor: Colors.secondary,
		justifyContent: 'center',
	},
	headerContainer: {
		alignItems: 'center',
		marginTop: size.s_30,
		paddingVertical: 10,
		paddingHorizontal: 20,
	},
	headerTitle: {
		fontSize: size.s_34,
		textAlign: 'center',
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	headerContent: {
		fontSize: size.s_14,
		lineHeight: 20 * 1.4,
		textAlign: 'center',
		color: '#CCCCCC',
	},
	orText: {
		fontSize: size.s_12,
		lineHeight: 15 * 1.4,
		color: '#AEAEAE',
		marginLeft: 5,
		alignSelf: 'center',
		paddingTop: 10,
	},
	googleButton: {
		marginVertical: size.s_20,
	},
});
