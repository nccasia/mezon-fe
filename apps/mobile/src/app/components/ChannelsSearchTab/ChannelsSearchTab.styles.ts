import { Attributes, size } from '@mezon/mobile-ui';
import { Dimensions, StyleSheet } from 'react-native';

const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			marginTop: size.s_10,
			paddingHorizontal: size.s_20,
			width: Dimensions.get('screen').width
		},
		title: {
			fontSize: size.medium,
			color: colors.white,
			fontWeight: '600',
			marginBottom: size.s_20
		}
	});

export default style;
