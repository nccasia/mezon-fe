import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        maxHeight: '34%',
    },
    listDMBadge: {
        maxHeight: '100%',
        width: '100%',
        flexGrow:0,
        paddingHorizontal: size.s_10
    },
    groupAvatar: {
        backgroundColor: Colors.orange,
        width: size.s_50,
        height: size.s_50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badge: {
        backgroundColor: Colors.red,
        position: 'absolute',
        borderRadius: size.s_14,
        borderWidth: 3,
        borderColor: Colors.secondary,
        minWidth: size.s_22,
        height: size.s_22,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: -3,
        right: -5
    },
    badgeText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: size.small
    },
    mb10: {
        marginBottom: size.s_10,
    },
    avatarWrapper: {
        borderRadius: 50,
        backgroundColor: Colors.bgGrayDark,
        height: size.s_50,
        width: size.s_50,
    },
    textAvatar: {
        width: size.s_50,
        height: size.s_50,
        textAlign: 'center',
        textAlignVertical: 'center',
        borderRadius: 50,
        fontSize: size.h5,
        color: Colors.white
    },
})
