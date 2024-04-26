import { Alert, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import TextInputUser from '../../components/Auth/TextInput';
import Button from '../../components/Auth/Button';
import GoogleLogin from '../../components/Auth/GoogleLogin';
import FooterAuth from '../../components/Auth/FooterAuth';
import {APP_SCREEN} from "../../navigation/ScreenTypes";
// import { useDispatch, useSelector } from 'react-redux';
// import { loginRequest } from '../../redux/Actions/authActions/action';
const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Please enter your email'),
    password: Yup.string().min(8, "Confiem password musr be 8 characters long.").required('Please enter your password').matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Must contain minimum 8 characters, at least one uppercase letter"
    ),
});
const LoginScreen = () => {
    // const dispatch = useDispatch();
    // const isLoading = useSelector(state => state.auth.loading);

    const navigation = useNavigation()
    return (
        <View style={styles.container}>
            {/* header */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>WELCOME BACK</Text>
                <Text style={styles.headerContent}>So glad to meet you again!</Text>
            </View>
            <GoogleLogin />
            <Text style={styles.orText}>Or</Text>
            {/* body */}
            <Formik
                initialValues={{
                    email: '',
                    password: ''
                }}
                validationSchema={LoginSchema}
                onSubmit={() => Alert.alert('Email or password not correct')}
            >
                {({ errors, touched, values, handleSubmit, handleChange, setFieldTouched, isValid }) => (
                    <>
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
                        {/* button  */}
                        <Button
                            disabled={!isValid}
                            onPress={handleSubmit}
                            isValid={isValid}
                            title={"Login"} />
                    </>
                )}
            </Formik>
            <FooterAuth
                content={'Need an account?'}
                onPress={() => navigation.navigate(APP_SCREEN.REGISTER)}
                title={"Register"}
            />
        </View>
    )
}

export default LoginScreen

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
    orText: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        color: "#AEAEAE",
        marginLeft: 5,
        alignSelf: 'center',
    },
})
