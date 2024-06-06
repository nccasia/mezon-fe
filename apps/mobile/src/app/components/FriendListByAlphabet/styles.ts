import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    listUserByAlphabetContainer: {
        flex: 1,
        overflow: 'scroll',
        paddingBottom: size.s_10
    },
    groupByAlphabetWrapper: {
        borderRadius: size.s_8,
    },
    findingFriendWrapper: {
        paddingTop: size.s_20,
    },
    groupFriendTitle: {
        color: Colors.textGray,
        paddingVertical: size.s_6
    },
    groupWrapper: {
        borderRadius: size.s_12,
        overflow: 'hidden',
    },
    friendText: {
        color: Colors.textGray,
        paddingVertical: size.s_18
    },
}) 