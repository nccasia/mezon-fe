import { Colors } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    textWrapper: {
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#00000060",
        position: "absolute",
        top: 0,
        left: 0,
    },
    textTitle: {
        color: Colors.white
    },
    content: {
        position: "relative",
        height: 100,
        width: 170,
        borderRadius: 10,
        overflow: "hidden"
    },
    container: {
        marginTop: 20,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
        gap: 10
    }
});

export default styles;