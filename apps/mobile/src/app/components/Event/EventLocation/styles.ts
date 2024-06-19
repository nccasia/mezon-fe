import { Colors, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        gap:  Metrics.size.s
    },

    inline: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
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
});

export default styles;