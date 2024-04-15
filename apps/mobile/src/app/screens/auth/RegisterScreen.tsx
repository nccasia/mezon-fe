import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import * as Yup from 'yup';
import { Formik } from 'formik';
import TextInputUser from '../../components/auth/TextInput';
import Button from '../../components/auth/Button';
import { useNavigation } from '@react-navigation/native';
import FooterAuth from '../../components/auth/FooterAuth';
import GoogleLogin from '../../components/auth/GoogleLogin';

const RegisterSchema = Yup.object().shape({

    FullName: Yup.string()
        .min(2, 'Too Short!')
        .required('Required'),
    email: Yup.string().email('Invalid email').required('Please enter your email'),
    password: Yup.string().min(8, "Confiem password musr be 8 characters long.").required('Please enter your password').matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Must contain minimum 8 characters, at least one uppercase letter"
    ),
    confirmPassword: Yup.string().min(8, "Confiem password musr be 8 characters long.").oneOf([Yup.ref('password')], "your password do not match").required("Confirm password is required"),
    mobile: Yup.string().min(10, 'Must be exactly 10 digits').max(10, 'Must be exactly 10 digits').matches(/^[0-9]+$/, "Must be only digits").required('Please enter your mobile number')

});
const RegisterScreen = () => {
    const navigation = useNavigation()
    return (
        <View style={styles.container}>
            {/* header */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Sign up</Text>
                <Text style={styles.headerContent}>So glad to meet you again!</Text>
            </View>
            <GoogleLogin />
            <Text style={styles.orText}>Or</Text>
            {/* body */}
            <Formik
                initialValues={{

                    FullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    mobile: ''
                }}
                validationSchema={RegisterSchema}
                onSubmit={values => {
                    Alert.alert(JSON.stringify(values))
                }}
            >
                {({ errors, touched, values, handleSubmit, handleChange, setFieldTouched, isValid }) => (
                    <>

                        {/*Full Name */}
                        <TextInputUser
                            label='Full name'
                            value={values.FullName}
                            onChangeText={handleChange('FullName')}
                            placeholder='Full name'
                            onBlur={() => setFieldTouched('FullName')}
                            touched={touched.FullName}
                            error={errors.FullName}
                            isPass={false}
                        />
                        {/* email */}
                        <TextInputUser
                            label='Email or phone'
                            value={values.email}
                            onChangeText={handleChange('email')}
                            placeholder='Email or phone'
                            onBlur={() => setFieldTouched('email')}
                            touched={touched.email}
                            error={errors.email}
                            isPass={false}
                        />

                        {/* password */}
                        <TextInputUser
                            label='Password'
                            value={values.password}
                            onChangeText={handleChange('password')}
                            placeholder='Password'
                            onBlur={() => setFieldTouched('password')}
                            touched={touched.password}
                            error={errors.password}
                            isPass={true}
                        />
                        {/* confirm password  */}
                        <TextInputUser
                            label='Confirm password'
                            value={values.confirmPassword}
                            onChangeText={handleChange('confirmPassword')}
                            placeholder='Confirm Password'
                            onBlur={() => setFieldTouched('confirmPassword')}
                            touched={touched.confirmPassword}
                            error={errors.confirmPassword}
                            isPass={true}
                        />
                        {/* mobile */}
                        <TextInputUser
                            label='Phone'
                            value={values.mobile}
                            onChangeText={handleChange('mobile')}
                            placeholder='Phone'
                            onBlur={() => setFieldTouched('mobile')}
                            touched={touched.mobile}
                            error={errors.mobile}
                            isPass={false}
                        />
                        {/* button  */}
                        <Button
                            disabled={!isValid}
                            onPress={handleSubmit}
                            isValid={isValid}
                            title={"Sign up"} />
                    </>
                )}
            </Formik>
            <FooterAuth
                content={'Have an account!'}
                onPress={() => navigation.navigate('Login')}
                title={"Login"}
            />
        </View>
    )
}

export default RegisterScreen

const styles = StyleSheet.create({
    InputText: {
        fontSize: 18,
        textAlignVertical: 'center',
        padding: 0,
        color: "#FFFFFF",
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#151515",
        justifyContent: 'center'
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 38,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    headerContent: {
        fontSize: 16,
        lineHeight: 20 * 1.4,
        textAlign: 'center',
        color: '#CCCCCC'
    },
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
    orText: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        color: "#AEAEAE",
        marginLeft: 5,
        alignSelf: 'center',
    },

    signupContainer: {
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    accountText: {
        fontSize: 15,
        lineHeight: 13 * 1.4,
        color: "#CCCCCC"
    },
    signupText: {
        fontSize: 15,
        lineHeight: 13 * 1.4,
        color: "#84ADFF",
        marginLeft: 5,
    },
})