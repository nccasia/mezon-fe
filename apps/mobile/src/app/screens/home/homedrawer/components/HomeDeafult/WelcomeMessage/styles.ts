import { Attributes, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    titleWelcomeMessage: {
        fontSize: size.s_22,
        marginBottom: size.s_10,
        color: colors.textStrong,
        fontWeight: '600',
    },

    subTitleWelcomeMessage: {
        fontSize: size.s_14,
        color: colors.text,
        marginBottom: size.s_10,
    },
    iconWelcomeMessage: {
        backgroundColor: colors.primary,
        marginBottom: size.s_10,
        width: 70,
        height: 70,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapperWelcomeMessage: {
		paddingHorizontal: size.s_10,
		marginVertical: size.s_30,
	},
});