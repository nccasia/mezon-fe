import { Attributes, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    container: {
        paddingHorizontal: Metrics.size.xl,
        marginHorizontal: Metrics.size.l,
        paddingVertical: Metrics.size.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 15,
        backgroundColor: colors.secondary,
        gap: Metrics.size.m
    },

    title: {
        color: colors.text,
        fontSize: Fonts.size.h7,
        fontWeight: "bold"
    },

    description: {
        fontSize: Fonts.size.h8,
        color: colors.textDisabled
    },

    mainSection: {
        gap: Metrics.size.s
    },

    inline: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: Metrics.size.s
    },

    smallText: {
        color: colors.text,
        fontSize: Fonts.size.h8,
    },
});