import { Attributes, baseColor, Fonts } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    image: {
        height: '100%',
        width: '100%',
    },

    fakeBox: {
        height: '100%',
        width: '100%',
        justifyContent: "center",
        alignItems: 'center',
        // backgroundColor: baseColor.blurple
    },

    altText: {
        color: baseColor.white,
        fontSize: Fonts.size.h4,
        textAlign: 'center',
        fontWeight: "bold",
    }
})
