import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

const style = (colors: Attributes) =>
	StyleSheet.create({
		channelName: {
			fontSize: size.label,
			color: colors.text,
			fontWeight: '600'
		},
		categoryChannel: {
			fontSize: size.label,
			color: colors.text,
			fontWeight: '400'
		},
		joinChannelBtn: {
			backgroundColor: colors.secondary,
			borderRadius: size.s_30,
			paddingHorizontal: size.s_20,
			paddingVertical: size.s_8,
			flexDirection: 'row',
			alignItems: 'center',
			gap: size.s_10
		},
		joinChannelBtnText: {
			fontSize: size.label,
			color: colors.text,
			fontWeight: '500'
		}
	});

export default style;
