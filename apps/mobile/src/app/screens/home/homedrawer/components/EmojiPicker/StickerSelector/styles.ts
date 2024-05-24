import { Colors } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    content: {
        height: 100, width: 100,
        borderRadius: 10,
        overflow: "hidden"
    },

    session: {

    },

    sessionTitle: {
        color: Colors.white
    },

    sessionContent: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "space-between",
        alignItems: "center"
    },

    bottomCategory: {
        position: "static",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "black",
        height: 50
    }
})

export default styles;