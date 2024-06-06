import { Colors } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	closeIcon: {
		color: Colors.white,
	},
	container: {
		flex: 1,
		backgroundColor: Colors.bgCharcoal,
	},
	bgDefault: {
		backgroundColor: Colors.bgCharcoal,
	},
	fill: {
		flex: 1,
	},
	headerWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 70,
		paddingBottom: 15,
		paddingHorizontal: 10,
		backgroundColor: Colors.bgDarkSlate,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	textTitle: {
		color: Colors.white,
		fontSize: 20,
		marginLeft: 10,
	},
	confirm: {
		color: Colors.white,
		fontSize: 18,
		marginLeft: 10,
	},
});
