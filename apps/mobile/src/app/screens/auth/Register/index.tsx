import { Colors, useTheme } from '@mezon/mobile-ui';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import Button from '../../../components/auth/Button';
import { FooterAuth } from '../../../components/auth/FooterAuth';
import { TextInputUser } from '../../../components/auth/TextInput';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { style } from './styles';

const RegisterSchema = Yup.object().shape({
	FullName: Yup.string().min(2, 'Too Short!').required('Required'),
	email: Yup.string().email('Invalid email').required('Please enter your email'),
	password: Yup.string().min(8, 'Confirm password must be 8 characters long.').required('Please enter your password'),
	confirmPassword: Yup.string()
		.min(8, 'Confiem password musr be 8 characters long.')
		.oneOf([Yup.ref('password')], 'your password do not match')
		.required('Confirm password is required'),
	mobile: Yup.string()
		.min(10, 'Must be exactly 10 digits')
		.max(10, 'Must be exactly 10 digits')
		.matches(/^\d+$/, 'Must be only digits')
		.required('Please enter your mobile number')
});
const RegisterScreen = () => {
	const styles = style(useTheme().themeValue);
	const navigation = useNavigation();

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: Colors.secondary }}>
			<KeyboardAvoidingView style={styles.container}>
				{/* header */}
				<View style={styles.headerContainer}>
					<Text style={styles.headerTitle}>Sign up</Text>
					<Text style={styles.headerContent}>So glad to meet you again!</Text>
				</View>
				{/* body */}
				<ScrollView>
					<Formik
						initialValues={{
							FullName: '',
							email: '',
							password: '',
							confirmPassword: '',
							mobile: ''
						}}
						validationSchema={RegisterSchema}
						onSubmit={(values) => {
							Alert.alert(JSON.stringify(values));
						}}
					>
						{({ errors, touched, values, handleSubmit, handleChange, setFieldTouched, isValid }) => (
							<>
								{/*Full Name */}
								<TextInputUser
									label="Full name"
									value={values.FullName}
									onChangeText={handleChange('FullName')}
									placeholder="Full name"
									onBlur={() => setFieldTouched('FullName')}
									touched={touched.FullName}
									error={errors.FullName}
									isPass={false}
								/>
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
								{/* confirm password  */}
								<TextInputUser
									label="Confirm password"
									value={values.confirmPassword}
									onChangeText={handleChange('confirmPassword')}
									placeholder="Confirm Password"
									onBlur={() => setFieldTouched('confirmPassword')}
									touched={touched.confirmPassword}
									error={errors.confirmPassword}
									isPass={true}
								/>
								{/* mobile */}
								<TextInputUser
									label="Phone"
									value={values.mobile}
									onChangeText={handleChange('mobile')}
									placeholder="Phone"
									onBlur={() => setFieldTouched('mobile')}
									touched={touched.mobile}
									error={errors.mobile}
									isPass={false}
								/>
								{/* button  */}
								<Button disabled={!isValid} onPress={handleSubmit} isValid={isValid} title={'Sign up'} />
							</>
						)}
					</Formik>
				</ScrollView>
				<FooterAuth content={'Have an account!'} onPress={() => navigation.navigate(APP_SCREEN.LOGIN as never)} title={'Login'} />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default RegisterScreen;
