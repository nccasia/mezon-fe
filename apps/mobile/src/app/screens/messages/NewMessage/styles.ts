import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    newMessageContainer: {
        backgroundColor: Colors.secondary,
        flex: 1,
        paddingHorizontal: size.s_18,
        gap: size.s_18
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
    defaultText: {
        color: Colors.textGray
    },
    actionsWrapper: {
        borderRadius: size.s_12,
        overflow: 'hidden',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: size.s_12,
        backgroundColor: Colors.bgDarkCharcoal,
        padding: size.s_10
    },
    actionTitle: {
        flex: 1,
        color: Colors.white
    },
    actionIconWrapper: {
        padding: size.s_8,
        borderRadius: 50
    },
    bgAddFriendIcon: {
        backgroundColor: Colors.pink
    },
    bgNewGroupIcon: {
        backgroundColor: Colors.bgViolet
    }
}) 