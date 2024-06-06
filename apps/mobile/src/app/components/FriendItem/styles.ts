import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: size.s_8,
        backgroundColor: Colors.bgDarkCharcoal,
        paddingHorizontal: size.s_10,
        paddingVertical: size.s_8
    },
    friendAvatar: {
        width: size.s_40,
        height: size.s_40,
        borderRadius: 50
    },
    friendItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1
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
    statusCircle: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 10,
        bottom: 0,
        right: -2,
        borderWidth: 2,
        borderColor: Colors.secondary,
    },
    friendAction: {
        flexDirection: 'row',
        gap: size.s_20,
        alignItems: 'center'
    },
    approveIcon: {
        backgroundColor: Colors.green,
        width: size.s_28,
        height: size.s_28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50
    },
    whiteText: {
        color: Colors.white
    },
    textAvatar: {
        backgroundColor: Colors.bgGrayDark,
        width: size.s_40,
        height: size.s_40,
        textAlign: 'center',
        textAlignVertical: 'center',
        borderRadius: 50,
        fontSize: size.h5,
        color: Colors.white
    },
    fill: {
        flex: 1
    },
    checkboxWrapper: {
        height: 20,
        width: 20,
    }
}) 