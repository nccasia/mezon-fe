import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    addFriendModalContainer: {
        paddingHorizontal: size.s_18,
        gap: size.s_18,
        flex: 1
    },
    whiteText: {
        color: Colors.white
    },
    searchInput: {
        borderRadius: size.s_10,
		color: Colors.white,
        paddingVertical: size.s_12  
    },
    searchUsernameWrapper: {
        backgroundColor: Colors.primary,
        borderRadius: size.s_10,
        alignItems: 'center',
        paddingHorizontal: size.s_12,
        flexDirection: 'row',
    },
    fill: {
        flex: 1
    },
    headerTitle: {
        color: Colors.white,
        fontSize: size.h5,
        textAlign: 'center',
    },
    defaultText: {
        color: Colors.textGray,
        paddingVertical: size.s_14
    },
    byTheWayText: {
        flexDirection: 'row',
        gap: size.s_4,
        alignItems: 'center'
    },
    buttonWrapper: {
        marginBottom: size.s_40
    },
    sendButton: {
        paddingVertical: size.s_14,
        backgroundColor: Colors.bgViolet,
        borderRadius: 50
    }
})
