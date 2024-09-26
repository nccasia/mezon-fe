import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		userInfoBox: { flexDirection: 'row', gap: size.s_14, alignItems: 'center', marginVertical: size.s_10 },
		userName: {
			fontSize: size.label,
			color: colors.white,
			fontWeight: '600'
		},
		subUserName: {
			fontSize: size.medium,
			color: colors.text,
			fontWeight: '600'
		}
	});
