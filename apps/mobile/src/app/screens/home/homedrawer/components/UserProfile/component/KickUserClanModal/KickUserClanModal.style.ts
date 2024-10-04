import { Attributes, baseColor, Colors, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {},
		userMinusIcon: { flexDirection: 'row', alignContent: 'center', justifyContent: 'center', marginBottom: size.s_20 },
		clanName: {
			textAlign: 'center',
			fontSize: size.medium,
			fontWeight: '700',
			color: colors.text,
			marginBottom: size.s_20
		},
		textError: { textAlign: 'center', fontSize: size.label, fontWeight: '700', color: Colors.vividScarlet, marginBottom: size.s_30 },
		description: {
			textAlign: 'center',
			fontSize: size.label,
			fontWeight: '600',
			color: colors.textDisabled,
			marginBottom: size.s_30,
			lineHeight: 1.4 * 16
		},
		textAreaBox: {
			paddingVertical: Metrics.size.xl,
			borderTopColor: colors.borderDim,
			borderTopWidth: 0.2
		},
		textReason: { fontSize: size.label, fontWeight: '600', color: Colors.textGray, marginBottom: size.s_10 },
		input: { backgroundColor: Colors.bgCharcoal, color: Colors.textGray, fontSize: size.label, fontWeight: '600' },
		button: { backgroundColor: Colors.bgPrimary, paddingHorizontal: size.s_10, paddingVertical: size.s_20 },

		textButton: {
			fontWeight: '700',
			textAlign: 'left',
			color: baseColor.red
		}
	});
