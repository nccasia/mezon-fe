import { Colors, Fonts, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.primary,
		paddingVertical: size.s_10,
		display: 'flex',
		flexDirection: 'column',
		gap: size.s_10,
	},
	label: {
		color: Colors.white,
		textTransform: 'uppercase',
		paddingHorizontal: size.s_20,
	},
	labelNormal: {
		color: Colors.white,
	},
	labelIconWrapper: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'row',
		gap: size.s_10,
	},
	description: {
		marginTop: size.s_10,
		paddingHorizontal: size.s_20,
		color: Colors.gray48,
		fontSize: Fonts.size.small,
	},
	input: {
		backgroundColor: Colors.secondary,
		marginVertical: size.s_10,
		color: Colors.white,
		paddingHorizontal: size.s_20,
		paddingVertical: 0,
		height: size.s_50,
	},
	checkboxWrapper: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: size.s_20,
		paddingVertical: size.s_10,
		backgroundColor: Colors.secondary,
	},
});

export default styles;
