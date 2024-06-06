import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        marginBottom: 10
    },
    fakeInput: {
        borderColor: Colors.gray48,
        borderWidth: 1,
        borderRadius: 10,
    },
    inputBox: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15
    },

    label: {
        color: Colors.gray48,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5
    },

    input: {
        paddingVertical: 0,
        color: Colors.white,
        flexBasis: 20,
        flexGrow: 1,
        height: size.s_40
    },

    clearBtn: {
        padding: 3,
        borderRadius: 10,
        backgroundColor: Colors.white
    },

    lineCountWrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingBottom: 10
    },

    count: {
        color: Colors.white,
        fontSize: 14,
        marginRight: 10
    }
})

export default styles;