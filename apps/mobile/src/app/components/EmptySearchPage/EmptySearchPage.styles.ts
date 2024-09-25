import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		emptyBox: {
			flexDirection: 'column',
			alignItems: 'center',
			marginTop: size.s_60,
			width: '100%',
			height: '100%'
		},
		textEmpty: {
			marginTop: size.s_10,
			fontSize: size.label,
			color: colors.text,
			textAlign: 'center'
		}
	});
