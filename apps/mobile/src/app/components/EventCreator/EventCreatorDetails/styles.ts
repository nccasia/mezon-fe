import { Colors, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    title: {
        color: Colors.white,
        fontSize: Fonts.size.h6,
        textAlign: "center"
    },

    subtitle: {
        color: Colors.gray72,
        fontSize: Fonts.size.h8,
        textAlign: "center"
    },

    bottomDescription: {
        color: Colors.gray72,
        fontSize: Fonts.size.h8,
        marginVertical: Metrics.size.l
    },

    headerSection: {
        marginVertical: Metrics.size.xl
    },

    container: {
        paddingHorizontal: Metrics.size.xl
    },

    feedSection: {
        marginBottom: Metrics.size.xl
    },

    inlineSec: {
        flexDirection: "row",
        gap: Metrics.size.xl
    },

    section: {
        gap: Metrics.size.m
    }
})

export default styles;