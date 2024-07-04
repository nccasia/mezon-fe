import { Attributes, Metrics, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    supperContainer: {
      flex: 1,
	    backgroundColor: colors.primary,
    },
	container: {
		flex: 1,
		backgroundColor: colors.primary,
		justifyContent: 'center',
	},
	headerContainer: {
		alignItems: 'center',
		marginTop: size.s_30,
		marginBottom: size.s_30,
		paddingVertical: Metrics.size.m,
		paddingHorizontal: Metrics.size.xl,
	},
	headerTitle: {
		fontSize: size.s_34,
		textAlign: 'center',
		fontWeight: 'bold',
		color: colors.textStrong,
	},
	headerContent: {
		fontSize: size.s_14,
		lineHeight: 20 * 1.4,
		textAlign: 'center',
		color: colors.text,
	},
	orText: {
		paddingHorizontal: size.s_20,
		fontSize: size.s_12,
		color: colors.text,
		alignSelf: 'center',
	},
	googleButton: {
		marginVertical: size.s_20,
	},
});
