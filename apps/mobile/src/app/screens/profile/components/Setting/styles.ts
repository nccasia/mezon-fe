import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    logoutButton: {
        backgroundColor: Colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        padding: size.s_10,
        paddingHorizontal: size.s_16,
        marginBottom: size.s_10,
        borderRadius: size.s_10,
        gap: size.s_10
    },
    logoutText: {
        fontWeight: '600',
        color: Colors.textRed,
        fontSize: size.label
    },
    title: {
        color: Colors.tertiary,
        fontSize: size.label
    },
    settingContainer: {
        padding: size.s_20
    },
    logoutIconWrapper: {
        height: 20,
        width: 20,
    }
})
