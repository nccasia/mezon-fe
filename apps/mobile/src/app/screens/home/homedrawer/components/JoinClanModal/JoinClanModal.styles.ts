import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	headerModal: { backgroundColor: Colors.transparent },
	title: {
		fontSize: size.h5,
		fontWeight: '600',
		color: Colors.white,
		textAlign: 'center',
		marginBottom: size.s_10
	},
	textInviteBtn: {
		fontSize: size.label,
		fontWeight: '500',
		color: Colors.white,
		textAlign: 'center'
	},
	btnInvite: {
		width: '100%',
		padding: size.s_10,
		backgroundColor: Colors.bgButton,
		borderRadius: size.s_50,
		position: 'absolute',
		bottom: size.s_60,
		left: size.s_20
	},
	description: {
		fontSize: size.label,
		fontWeight: '500',
		color: Colors.textGray,
		textAlign: 'center'
	},
	textExample: {
		fontSize: size.label,
		fontWeight: '400',
		color: Colors.textGray
	}
});
