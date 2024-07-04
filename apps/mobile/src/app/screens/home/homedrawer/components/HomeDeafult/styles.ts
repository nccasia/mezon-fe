import { Attributes, Colors } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    homeDefault: {
		backgroundColor: colors.secondary,
		flex: 1,
	},

	channelView: {
		flex: 1, 
		backgroundColor: colors.secondary
	}
});