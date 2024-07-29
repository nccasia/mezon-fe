import { Attributes } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    buttonWrapper: {
        backgroundColor: colors.primary,
        borderRadius: 3,
        elevation: 1
    },
    text: {
        color: colors.text,
        textAlign: 'center',
    },
    disable: {
        opacity: .4,
    },
    fill: {
        flex: 1
    }
})