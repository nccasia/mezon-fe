import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { useState } from 'react';
import Entypo from 'react-native-vector-icons/Entypo';

interface UserTextInputProps {
    placeholder: string;
    isPass: boolean;
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    label: string,
    error: string,
    touched: boolean,
}
const TextInputUser: React.FC<UserTextInputProps> = ({
    error, touched, label, placeholder, isPass, value, onChangeText, onBlur
}) => {
    const [showPass, setShowPass] = useState<boolean>(true);
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}<Text style={{ color: 'red' }}> *</Text></Text>
            <View style={styles.inputTexts}>
                <TextInput
                    style={styles.inputText}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    onBlur={onBlur}
                    secureTextEntry={isPass && showPass}
                    placeholderTextColor='#535353'
                    autoCapitalize='none'
                />{isPass && (
                    <Pressable onPress={() => setShowPass(!showPass)}>
                        <Entypo name={`${showPass ? "eye" : "eye-with-line"}`} size={24} color={'#6c6d83'} />
                    </Pressable>
                )}
            </View>

            {touched && error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    )
}

export default TextInputUser

const styles = StyleSheet.create({
    container: {

    },
    label: {
        fontSize: 20,
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: 20,
        color: '#FFFFFF'
    },
    inputTexts: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingLeft: 10,
        marginRight: 20,
        marginLeft: 20
    },

    inputText: {
        fontSize: 18,
        color: "#FFFFFF",
    },
    errorText: {
        fontSize: 15,
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: 20,
        color: 'red'
    }
})