import { Colors } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    listHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: "absolute",
        top: 2,
        left: 0,
        padding: 5,
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 10
    },

    titleNameWrapper: {
        maxWidth: '85%',
        display: "flex",
        backgroundColor: Colors.gray4850,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 5,
        alignItems: "center",
    },

    titleServer: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16
    },

    infoHeader: {
        width: '100%',
        display: "flex",
        flexDirection: "row",
        gap: 5,
        alignItems: "center"
    },

    textInfo: {
        color: Colors.gray72,
        fontSize: 9,
    },

    actions: {
        padding: 4,
        backgroundColor: Colors.gray4850,
        borderRadius: 999
    },

    container: {
        height: 150,
        width: "100%",
        position: "relative",
        marginBottom: 20
    }
});

export default styles;
