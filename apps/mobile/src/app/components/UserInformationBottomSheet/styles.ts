import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.bgCharcoal,
		width: '100%',
		borderTopRightRadius: 8,
		borderTopLeftRadius: 8
	},
	bottomSheetBarWrapper: {
		height: 20,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		position: 'absolute'
	},
	bottomSheetBar: {
		width: size.s_30,
		height: size.s_4,
		borderRadius: 20,
		backgroundColor: Colors.bgCharcoal
	},
	bottomSheet: {
		borderTopLeftRadius: size.s_14,
		borderTopRightRadius: size.s_14,
		overflow: 'hidden'
	}
});
