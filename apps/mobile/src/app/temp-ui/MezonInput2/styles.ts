import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    label: {
        color: Colors.white,
        textTransform: 'uppercase',
        paddingHorizontal: size.s_20,
    },
    input: {
		backgroundColor: Colors.secondary,
		marginVertical: size.s_10,
		color: Colors.white,
		paddingHorizontal: size.s_20,
		paddingVertical: 0,
		height: size.s_50,
	},
})

export default styles;