import { Colors } from "@mezon/mobile-ui";
import { Dimensions, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: Dimensions.get("screen").width
    },

    btnIcon: {
        padding: 7,
        borderRadius: 10,
        backgroundColor: Colors.green
    },
    
    btnGroup: {
        // backgroundColor: "red",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 10,
        marginTop: -20
    }
})

export default styles;