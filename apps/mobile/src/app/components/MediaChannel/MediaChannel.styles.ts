import { Attributes, size } from '@mezon/mobile-ui';
import { Dimensions, StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			width: Dimensions.get('screen').width,
			paddingHorizontal: size.s_10,
			borderTopRightRadius: size.s_18,
			borderTopLeftRadius: size.s_18,
			overflow: 'hidden',
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: size.s_6
		},
		overlay: {
			position: 'absolute',
			alignItems: 'center',
			justifyContent: 'center',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			backgroundColor: 'rgba(000,000,000,0.8)'
		},
		wrapper: { height: '100%' }
	});
