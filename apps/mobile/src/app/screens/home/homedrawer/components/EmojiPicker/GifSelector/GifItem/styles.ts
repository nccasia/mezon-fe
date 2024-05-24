import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
        gap: 10
    },
    
    content: {
        position: "relative",
        height: 100,
        flex: 1,
        flexBasis: 170,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "black"
    },
})

export default styles;