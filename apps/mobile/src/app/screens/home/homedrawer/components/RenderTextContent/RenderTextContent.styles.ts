import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  contentMessageMention: {
		fontSize: size.medium,
		fontWeight: '600',
		color: Colors.textLink,
	},
  contentMessageBox: {
		fontSize: size.medium,
		color: Colors.tertiary,
		marginTop: -5
	},
	iconEmojiInMessage: {
		width: size.s_18,
		height: size.s_18,
	},
})
