import { Colors, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: Metrics.size.s,
        borderRadius: 50,
        backgroundColor: Colors.gray72,
        paddingHorizontal: 7,
        paddingVertical: Metrics.size.xs
    },

    containerSuccess: {
        backgroundColor: Colors.green,
    },

    containerDanger: {
        backgroundColor: Colors.textRed,
    },

    containerWarning: {
        backgroundColor: Colors.textViolet,
    },

    title: {
        color: Colors.white,
        fontSize: Fonts.size.h9,
    }
})

export default styles;