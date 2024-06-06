import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    btn: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: size.s_10,
        backgroundColor: Colors.secondary,
        paddingLeft: 20
    },
    btnTitle: {
        color: Colors.tertiary,
        fontSize: 14,
    },

    btnTitleWrapper: {
        padding: 15,
        paddingLeft: 0,
        flexGrow: 1
    },
    borderBottom: {
        borderBottomColor: Colors.borderDim,
        borderBottomWidth: 1,
    }
})

export default styles;