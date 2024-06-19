import { Colors, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    inline: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignContent: "center",
        gap: Metrics.size.s
    },

    smallText: {
        color: Colors.white,
        fontSize: Fonts.size.h8,
    }
})

export default styles;