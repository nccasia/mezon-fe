import { Colors, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Metrics.size.xl,
        marginHorizontal: Metrics.size.xl,
        paddingVertical: Metrics.size.xl,
        borderWidth: 1,
        borderColor: Colors.gray48,
        borderRadius: 15,
        backgroundColor: Colors.secondary,
        gap: Metrics.size.m
    },

    title: {
        color: Colors.white,
        fontSize: Fonts.size.h7,
        fontWeight: "bold"
    },

    description: {
        fontSize: Fonts.size.h8,
        color: Colors.gray48
    },

    mainSection: {
        gap:  Metrics.size.s
    },

    inline: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap:  Metrics.size.s
    },

    smallText: {
        color: Colors.white,
        fontSize: Fonts.size.h8,
    },
})

export default styles;