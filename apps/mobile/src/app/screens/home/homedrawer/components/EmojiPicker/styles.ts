import { Colors, Fonts } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        padding: 10,
        height: "100%"
    },
    tabContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        padding: 6,
        // width: "100%",
        backgroundColor: Colors.primary,
        borderRadius: 50,
    },
    selected: {
        flex: 1,
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 6,
    },
    textInput: {
        color: Colors.white,
        flexGrow: 1,
        fontSize: 9,
        height: 40,
    },

    textInputWrapper: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: Colors.black,
        marginVertical: 10,
        alignItems: "center",
        paddingHorizontal: 10,
        borderRadius: 10,
        gap: 10
    }
});

export default styles;