import { Attributes, Fonts, Metrics, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    container: {
        marginBottom: 10
    },
    fakeInput: {
        borderColor: colors.border,
        backgroundColor: colors.secondary,
        borderWidth: 1,
        borderRadius: 10
    },

    fakeInputFocus: {
        borderColor: colors.secondary,
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
        color: colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5
    },

    input: {
        paddingVertical: 0,
        paddingHorizontal: 10,
        color: colors.textStrong,
        flexGrow: 1,
    },

    clearBtn: {
        borderRadius: 10
    },

    lineCountWrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingBottom: 10
    },

    count: {
        color: colors.text,
        fontSize: Fonts.size.h8,
        marginRight: 10
    },

    errorInput: {
        paddingHorizontal: Metrics.size.m
    },

    titleUppercase: {
        fontSize: Fonts.size.h7,
        textTransform: "uppercase"
    }
})