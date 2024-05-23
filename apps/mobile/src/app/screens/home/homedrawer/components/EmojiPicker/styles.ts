import { Colors } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        padding: 10,
        height: "100%"
    },
    tabContainer: {
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        padding: 6,
        width: "100%",
        backgroundColor: Colors.primary,
        borderRadius: 50
    },
    selected: {
        flex: 1,
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 6,
    }
});

export default styles;