import { Colors, size, verticalScale } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapperMessageBox: {

	},
	imageMessageRender: {
		borderRadius: verticalScale(5),
	},
  contentMessageBox: {
		fontSize: size.s_16,
		color: Colors.tertiary,
	},
	contentMessageLink: {
		fontSize: size.s_16,
		color: Colors.textLink,
	},
  contentMessageMention: {
		fontSize: size.s_16,
		fontWeight: '600',
		color: Colors.textLink,
	},
})
