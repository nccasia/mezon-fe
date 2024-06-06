import { Colors, Fonts } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        marginHorizontal: 20,
        borderRadius: 10,
        marginTop: 20,
        padding: 20
    },

    name: {
        color: Colors.white,
        fontWeight: "700",
        fontSize: Fonts.size.h5,
    },

    username: {
        color: Colors.white,
        fontSize: Fonts.size.small,
    },

    nameWrapper: {
        marginBottom: 20
    }
})

export default styles;