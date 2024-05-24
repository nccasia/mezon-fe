import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.secondary,
        flex: 1,
        paddingHorizontal: size.s_18
    },
    headerWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: size.s_20
    },
    headerTitle: {
        fontSize: size.h6,
        color: Colors.white
    },
    addFriendWrapper: {
        flexDirection: 'row',
        gap: size.s_8,
        alignItems: 'center',
        backgroundColor: Colors.bgDarkSlate,
        borderRadius: 20,
        paddingHorizontal: size.s_10,
        paddingVertical: size.s_6
    },
    addFriendText: {
        fontSize: size.label,
        color: Colors.white
    },
    dmMessageListContainer: {
        marginTop: 20
    },
    searchMessage: {
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
    statusCircle: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 10,
        bottom: 1,
        right: 0,
        borderWidth: 2,
        borderColor: Colors.secondary,
    },
    messageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: size.s_8
    },
    friendAvatar: {
        width: size.s_50,
        height: size.s_50,
        borderRadius: 50
    },
    messageContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    online: {
        backgroundColor: Colors.green,
    },
    offline: {
        backgroundColor: Colors.bgGrayDark,
    },
    defaultText: {
        color: Colors.textGray
    },
    addMessage: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: size.s_50,
        height: size.s_50,
        backgroundColor: Colors.bgButton,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    }
})