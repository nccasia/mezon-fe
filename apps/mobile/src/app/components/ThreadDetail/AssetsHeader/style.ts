import { Attributes, Colors } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		headerTab: {
			marginTop: 20,
			padding: 20,
			paddingVertical: 10,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-start',
			alignItems: 'center',
			gap: 20
		},

		tabLabel: {
			color: Colors.white
		},

		a: {
			width: '100%',
			paddingHorizontal: 20,
			position: 'relative',
			marginBottom: 10
		},
		b: {
			position: 'absolute',
			backgroundColor: Colors.bgViolet,
			height: 3,
			top: 0,
			borderRadius: 50
		}
	});
