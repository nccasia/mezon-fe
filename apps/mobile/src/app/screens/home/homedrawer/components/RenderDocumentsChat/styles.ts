import { Attributes, Colors, size, verticalScale } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		fileViewer: {
			gap: size.s_6,
			marginVertical: size.s_6,
			paddingHorizontal: size.s_10,
			width: '80%',
			minHeight: verticalScale(50),
			alignItems: 'center',
			borderRadius: size.s_6,
			flexDirection: 'row',
			backgroundColor: colors.primary
		},
		fileName: {
			fontSize: size.small,
			color: colors.text
		},
		typeFile: {
			fontSize: size.small,
			color: Colors.textGray,
			textTransform: 'uppercase'
		}
	});
