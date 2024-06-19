import { Colors, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Metrics.size.xl,
        paddingVertical: Metrics.size.xl,
        borderWidth: 1,
        borderColor: Colors.gray48,
        borderRadius: 15,
        backgroundColor: Colors.secondary,
        gap: Metrics.size.xs
    },
    description: {
        fontSize: Fonts.size.h8,
        color: Colors.gray48
    },
    title: {
        fontSize: Fonts.size.h7,
        color: Colors.white
    },
    infoSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: Metrics.size.m
    },

    inline: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: Metrics.size.s
    },

    tinyText: {
        color: Colors.white,
        fontSize: Fonts.size.tiny,
    },

    smallText: {
        color: Colors.white,
        fontSize: Fonts.size.h8,
    },

    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        overflow: "hidden"
    },

    infoRight: {
        gap: Metrics.size.l
    },

    mainSec: {
        gap: 5,
        marginBottom: Metrics.size.m
    }
})

export default styles;