import { Attributes, baseColor } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		boxBorder: {
			borderRadius: 15,
			backgroundColor: 'transparent',
			borderColor: baseColor.blurple,
			borderWidth: 2
		},

		boxSelect: {
			width: '100%',
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'center'
		},

		selectList: {
			gap: 9.7,
			alignItems: 'center'
		},
		selectListWrapper: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			zIndex: 1000
		},

		title: {
			color: colors.text
		}
	});
