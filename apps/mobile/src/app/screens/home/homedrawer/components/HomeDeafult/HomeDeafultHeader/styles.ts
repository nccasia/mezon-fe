import { Attributes, Colors, Metrics, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    actionGroup: {
        paddingRight: Metrics.size.xl
    },

    homeDefaultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.primary,
    },

    iconBar: {
        paddingLeft: size.s_14,
        paddingRight: size.s_18,
        paddingVertical: size.s_14,
    },

    channelContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    threadHeaderBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    threadHeaderLabel: {
        color: colors.textStrong,
        fontWeight: "700",
        marginLeft: size.s_10,
        fontSize: size.label,
        width: '85%'
    },

    channelHeaderLabel: {
        color: colors.textStrong,
        marginLeft: size.s_10,
        fontSize: size.medium,
        maxWidth: '85%'
    },
});