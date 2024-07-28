import { Attributes, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    inline: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: Metrics.size.s
    },

    smallText: {
        color: colors.text,
        fontSize: Fonts.size.h8,
    }
})