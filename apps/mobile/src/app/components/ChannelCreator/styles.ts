import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: size.s_10,
        display: 'flex',
        flexDirection: 'column',
        gap: size.s_10,
    },

    menu: {
        paddingHorizontal: 20
    }
});

export default styles;