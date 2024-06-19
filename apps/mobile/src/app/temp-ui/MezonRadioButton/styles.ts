import { Colors, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    outer: {
        borderRadius: 999,
        borderWidth: 2,
        padding: 3,
        borderColor: Colors.gray72,
    },

    inner: {
        height: 12,
        width: 12,
        borderRadius: 10,
        overflow: 'hidden'
    },

    innerChecked: {
        backgroundColor: Colors.green
    },

    outerChecked: {
        borderColor: Colors.white,
    },

    container: {
        padding: Metrics.size.s
    }
})

export default styles;