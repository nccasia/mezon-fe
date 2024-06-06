import { Colors } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    switchContainer: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: Colors.primary,
        borderRadius: 50,
        margin: 10,
        padding: 5,
        gap: 10
    },

    switchWrapper: {
        flex: 1
    },

    switchButton: {
        borderRadius: 50,
        padding: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },

    switchButtonActive: {
        backgroundColor: Colors.green
    },

    switchText: {
        color: Colors.white
    }
})

export default styles;