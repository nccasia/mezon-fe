import { Colors, Fonts, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	modalContainer: {
		maxWidth: '100%',
		minHeight: '30%',
		backgroundColor: Colors.bgDarkCharcoal,
		paddingHorizontal: size.s_10,
		paddingVertical: size.s_20,
		borderRadius: size.s_8
	},
	title: {
		fontSize: size.s_18,
		fontWeight: '700',
		color: Colors.white
	},
	description: {
		fontSize: size.label,
		fontWeight: '400',
		color: Colors.white,
		marginTop: size.s_30,
		marginBottom: size.s_20,
		lineHeight: 16 * 1.4,
		textAlign: 'left'
	},
	noButton: {
		borderRadius: 50,
		backgroundColor: Colors.bgGrayDark,
		width: '100%',
		paddingVertical: 10
	},
	yesButton: {
		borderRadius: 50,
		backgroundColor: Colors.red,
		width: '100%',
		paddingVertical: 10,
		marginBottom: size.s_10
	},
	textButton: {
		color: Colors.white,
		fontWeight: '600',
		textAlign: 'center'
	},
	contentText: {
		color: Colors.textGray,
		fontSize: Fonts.size.small,
		lineHeight: size.s_18
	}
});
