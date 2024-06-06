import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    friendContainer: {
        backgroundColor: Colors.secondary,
        flex: 1,
        paddingHorizontal: size.s_18,
        gap: size.s_14
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
    requestFriendWrapper: {
        backgroundColor: Colors.bgDarkCharcoal,
        paddingHorizontal: size.s_10,
        paddingVertical: size.s_8,
        borderRadius: size.s_8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        alignItems: 'center'
    },
    fill: {
        flex: 1
    },
    requestContentWrapper: {
        flexDirection: 'row',
        gap: size.s_4
    },
    defaultText: {
        color: Colors.textGray
    },
})
