import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	languageSettingContainer: {
		backgroundColor: Colors.secondary,
		flex: 1,
		paddingHorizontal: size.s_18
	},
	languageItem: {
		flexDirection: 'row',
		backgroundColor: Colors.bgDarkCharcoal,
		padding: size.s_10,
		justifyContent: 'space-between'
	},
	optionText: {
		color: Colors.textGray,
		fontSize: size.medium
	}
});
