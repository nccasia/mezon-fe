import { StyleSheet } from "react-native";
import { Colors, Fonts, Metrics, size } from "@mezon/mobile-ui";

const styles = StyleSheet.create({
    btn: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: size.s_10,
        backgroundColor: Colors.secondary,
        paddingLeft: Metrics.size.xl,
    },

    btnTextWrapper: {
        flexBasis: 10,
        flexGrow: 1,
    },

    btnTitle: {
        color: Colors.tertiary,
        fontSize: Fonts.size.h7,
    },

    btnDescription: {
        color: Colors.gray48,
        fontSize: Fonts.size.h8,
    },

    btnTitleWrapper: {
        padding: Metrics.size.l,
        paddingLeft: 0,
        flexGrow: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: Metrics.size.s,
        flexBasis:10
    },
    borderBottom: {
        borderBottomColor: Colors.borderDim,
        borderBottomWidth: 1,
    },

    disable: {
        opacity: 0.8
    }
})

export default styles;