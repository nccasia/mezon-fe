import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.secondary,
        flex: 1,
        paddingBottom: 20
    },
    backArrow: {
        paddingLeft: size.s_12
    },
    saveChangeButton: {
        paddingRight: size.s_12,
        fontSize: size.regular
    },
    changed: {
        color: Colors.textViolet
    },
    notChange: {
        color: Colors.titleSteelGray
    }
})

export default styles;