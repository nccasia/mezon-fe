import { Colors, Fonts, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        marginBottom: 10
    },
    fakeInput: {
        borderColor: Colors.gray48,
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 10
    },

    fakeInputFocus: {
        borderColor: Colors.gray48,
    },

    fakeInputBlur: {
        borderColor: "transparent",
    },

    inputBox: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: size.s_14,
        paddingVertical: size.s_10,
    },

    label: {
        color: Colors.gray72,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5
    },

    input: {
        paddingVertical: 0,
        color: Colors.white,
        flexGrow: 1,
    },

    clearBtn: {
        padding: 3,
        borderRadius: 10,
        backgroundColor: Colors.white
    },

    lineCountWrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingBottom: 10
    },

    count: {
        color: Colors.white,
        fontSize: Fonts.size.h8,
        marginRight: 10
    }
})

export default styles;