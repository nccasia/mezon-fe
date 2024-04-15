import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
interface FooterAuthProps {
    content: string;
    title: string;
    onPress?: () => void;

}
const FooterAuth: React.FC<FooterAuthProps> = ({ onPress, content, title }) => {
    return (
        <View style={styles.signupContainer}>
            <Text style={styles.accountText}>{content}   </Text>
            <Text
                style={styles.signupText}
                onPress={onPress}
            >
                {title}
            </Text>
        </View>
    )
}

export default FooterAuth

const styles = StyleSheet.create({
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