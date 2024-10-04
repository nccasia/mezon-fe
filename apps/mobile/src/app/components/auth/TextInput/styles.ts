import { Attributes, Fonts, Metrics, baseColor, size, verticalScale } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			marginBottom: verticalScale(15)
		},
		label: {
			fontSize: size.s_16,
			marginTop: verticalScale(10),
			marginBottom: verticalScale(10),
			marginHorizontal: verticalScale(20),
			color: colors.textStrong
		},
		inputTexts: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			height: 50,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 5,
			paddingHorizontal: Metrics.size.m,
			paddingLeft: Metrics.size.m,
			marginRight: Metrics.size.xl,
			marginLeft: Metrics.size.xl
		},

		inputText: {
			fontSize: size.s_16,
			color: colors.textStrong,
			width: '90%'
		},
		errorText: {
			fontSize: Fonts.size.h7,
			marginTop: Metrics.size.m,
			marginHorizontal: Metrics.size.xl,
			color: baseColor.red
		},
		require: {
			color: baseColor.red
		}
	});
