import { Colors, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        padding: Metrics.size.m,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        borderRadius: 5,
        overflow: 'hidden',
        borderWidth: 1,
        backgroundColor: Colors.darkGray,
        gap: 5,
        alignItems: "center",
        borderColor: Colors.darkGray
    },

    containerSuccess: {
        backgroundColor: Colors.green,
    },

    containerWarning: {
        backgroundColor: Colors.green,
    },

    containerDanger: {
        backgroundColor: Colors.green,
    },

    fluid: {
        flexBasis: 10,
        flexGrow: 1
    },

    border: {
        backgroundColor: "transparent",
    },

    title: {
        color: Colors.white,
        fontSize: Fonts.size.h8
    }
})

export default styles;