import { Colors } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    bannerContainer: {
        height: 150,
        width: "100%",
        padding: 20
    },

    btnRound: {
        padding: 7,
        borderRadius: 50,
        backgroundColor: Colors.primary,
    },

    btnGroup: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center"
    },

    avatar: {
        height: 100,
        width: 100,
        borderRadius: 100,
        borderColor: Colors.primary,
        borderWidth: 5
    },

    avatarContainer: {
        position: "relative",
        marginTop: -65,
        marginLeft: 16,
        width: 100
    },

    absolute: {
        position: "absolute",
        top: 0,
        right: 0,
    },

    onLineStatus: {
        position: "absolute",
        bottom: 0,
        right: 5,
        height: 25,
        width: 25,
        borderRadius: 100,
        borderWidth: 3,
        backgroundColor: Colors.green
    }
})

export default styles;