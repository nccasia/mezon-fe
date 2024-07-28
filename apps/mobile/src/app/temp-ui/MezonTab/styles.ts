import { Attributes, Metrics } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        flex: 1,
        paddingBottom: Metrics.size.xl
    }
})