import { Attributes, size } from '@mezon/mobile-ui';
import { Dimensions, StyleSheet } from 'react-native';

const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			backgroundColor: colors.primary,
			paddingHorizontal: size.s_20,
			width: Dimensions.get('screen').width,
			height: Dimensions.get('screen').height
		},
		boxMembers: {
			marginTop: size.s_10,
			borderRadius: size.s_14,
			backgroundColor: colors.secondary,
			flex: 1,
			marginBottom: 200
		}
	});

export default style;
