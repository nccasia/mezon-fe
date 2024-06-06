import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    newGroupContainer: {
        backgroundColor: Colors.secondary,
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: size.s_18,
    },
    headerWrapper: {
        flexDirection: 'row',
        padding: size.s_14,
        gap: size.s_14,
        alignItems: 'center',
    },
    screenTitleWrapper: {
        flex: 1,
        alignItems: 'center'
    },
    screenTitle: {
        color: Colors.white,
        fontSize: size.h6
    },
    actions: {
        flexDirection: 'row',
        gap: size.s_20
    },
    actionText: {
        color: Colors.textViolet,
        fontSize: size.label
    },
    searchFriend: {
		backgroundColor: Colors.primary,
		borderRadius: 40,
		alignItems: 'center',
		paddingHorizontal: size.s_12,
		flexDirection: 'row',
	},
	searchInput: {
		width: '93%',
		borderRadius: 20,
		color: Colors.white,
        paddingVertical: size.s_6
	},
})