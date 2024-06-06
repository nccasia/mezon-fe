import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
	notifyContainer: {
		paddingHorizontal: size.s_10,
		marginBottom: size.s_10,
	},
	notifyHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 10,
	},
	notifyContent: {
		flex: 1,
		marginLeft: size.s_6,
	},
	notifyHeaderTitle: {
		color: Colors.textGray,
		fontSize: size.medium,
		fontWeight: '400',
		marginBottom: 5,
	},
	notifyDuration: {
		color: Colors.textGray,
	},
	boxImage: {
		width: size.s_40,
		height: size.s_40,
		borderRadius: 50,
		marginBottom: 10,
		fontSize: size.medium,
	},
	image: {
		width: '90%',
		height: '90%',
		borderRadius: 50,
	},
	boxImageChar: {
		width: size.s_40,
		height: size.s_40,
		borderRadius: size.s_40,
		backgroundColor: Colors.bgDarkCharcoal,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	contentMessage: {
		marginBottom: 10,
		borderLeftColor: Colors.borderNeutralDisable,
		borderLeftWidth: 2,
		paddingLeft: 8,
		fontSize: size.medium,
	},
});
