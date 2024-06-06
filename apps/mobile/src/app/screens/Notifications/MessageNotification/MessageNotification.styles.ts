import { Colors, size, verticalScale } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapperMessageBox: {

	},
	imageMessageRender: {
		borderRadius: verticalScale(5),
	},
  contentMessageBox: {
	  fontSize: size.medium,
		color: Colors.tertiary,
	},
	contentMessageLink: {
		fontSize: size.medium,
		color: Colors.textLink,
	},
  contentMessageMention: {
	  fontSize: size.medium,
		fontWeight: '600',
		color: Colors.textLink,
	},
})
