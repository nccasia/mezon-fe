import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    logoutText: {
        fontWeight: '600',
        color: Colors.textRed,
        fontSize: size.label
    },
    settingContainer: {
        padding: size.s_20,
        backgroundColor: Colors.primary,
    },
    logoutIconWrapper: {
        height: 20,
        width: 20,
    },

    sectionWrapper: {
        marginBottom: 20
    },

    section: {
        backgroundColor: Colors.secondary,
        borderRadius: 10,
        overflow: 'hidden',
    },

    sectionTitle: {
        color: Colors.white,
        fontSize: size.small,
        fontWeight: '600',
        marginBottom: size.s_10
    }
})
