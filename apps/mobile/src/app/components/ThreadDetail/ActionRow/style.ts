import { Colors, Fonts, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        gap: 30,
        flex: 0,
        paddingTop: size.s_14
    },

    optionText: {
        color: Colors.white,
        fontFamily: 'bold',
        fontSize: Fonts.size.medium
    },

    iconWrapper: {
        backgroundColor: Colors.tertiaryWeight,
        padding: 15,
        borderRadius: 50
    },

    iconBtn: {
        flexDirection: 'column',
        alignItems: 'center'
    },
})

export default styles;