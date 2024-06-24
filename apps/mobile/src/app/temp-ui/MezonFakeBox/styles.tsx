import { Colors, Fonts, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    box: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.secondary,
        gap: Metrics.size.l,
        paddingHorizontal: Metrics.size.m,
        paddingVertical: Metrics.size.m,
        borderRadius: 10
    },
    textBox: {
        color: Colors.white,
        flex: 1,
        flexGrow: 1,
        flexBasis: 10,
        fontSize: Fonts.size.h7
    },

    sectionTitle: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: Fonts.size.s_10
    }
})

export default styles;