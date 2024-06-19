import { Text, TextInput, View } from "react-native";
import React from "react";
import styles from "./styles";

interface IMezonInput2 {
    placeHolder?: string;
    label?: string;
    value: string;
    onTextChange?: (value: string) => void;
}

export default function MezonInput({ label, placeHolder, value, onTextChange }: IMezonInput2) {
    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                placeholderTextColor={'gray'}
                placeholder={placeHolder}
                style={styles.input}
                value={value}
                onChangeText={onTextChange}
            />
        </View>
    )
}