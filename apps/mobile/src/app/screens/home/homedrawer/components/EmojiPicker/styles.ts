import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
		padding: size.s_10,
		height: '100%',
	},
	tabContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 10,
		padding: 6,
		backgroundColor: Colors.primary,
		borderRadius: 50,
	},
	selected: {
		flex: 1,
		flexBasis: 100,
		borderRadius: 50,
		paddingHorizontal: 20,
		paddingVertical: 6,
	},
	textInput: {
		color: Colors.white,
		flexGrow: 1,
		fontSize: size.medium,
		height: size.s_40,
	},

	textInputWrapper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
		backgroundColor: Colors.black,
		marginVertical: 10,
		alignItems: 'center',
		paddingHorizontal: 10,
		borderRadius: 10,
		gap: 10,
	},
});

export default styles;
