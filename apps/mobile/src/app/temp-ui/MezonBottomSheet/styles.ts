import { Colors, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    backgroundStyle: {
        backgroundColor: Colors.primary
    },

    header: {
        display: "flex",
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },

    section: {
        flex: 1
    },

    sectionTitle: {
        textAlign: "center",
        color: Colors.white,
        fontWeight: "bold"
    },

    sectionRight: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingRight: Metrics.size.m
    },

    sectionLeft: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        paddingLeft: 10
    }
})

export default styles;