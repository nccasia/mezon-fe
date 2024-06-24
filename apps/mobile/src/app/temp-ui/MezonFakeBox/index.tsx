import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";

interface IMezonFakeBoxProps {
    title?: string;
    prefixIcon?: ReactNode;
    postfixIcon?: ReactNode;
    value: string;
    onPress?: () => void;
}

export default function MezonFakeInputBox({ title, prefixIcon, postfixIcon, value, onPress }: IMezonFakeBoxProps) {
    return (
        <View>
            {title && <Text style={styles.sectionTitle}>{title}</Text>}

            <TouchableOpacity onPress={onPress}>
                <View style={styles.box}>
                    {prefixIcon}
                    <Text style={styles.textBox}>{value}</Text>
                    {postfixIcon}
                </View>
            </TouchableOpacity>
        </View>
    )
};