import { Attributes, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    container: {
        padding: Metrics.size.xl
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
    },

    text: {
        color: colors.text,
        marginLeft: Metrics.size.l,
        fontWeight: "500"
    },
})