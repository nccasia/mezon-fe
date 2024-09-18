import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			width: '100%',
			height: '100%',
			paddingHorizontal: size.s_10,
			paddingVertical: size.s_10
		},
		messageBox: {
			flexDirection: 'column',
			gap: size.s_10,
			marginVertical: size.s_10
		},
		groupMessageLabel: {
			color: colors.text,
			fontSize: size.label,
			fontWeight: '600',
			marginBottom: size.s_10
		},
		message: {
			flexDirection: 'row',
			gap: size.s_10
		},
		messageContent: {},
		messageUerInfo: {
			flexDirection: 'row',
			gap: size.s_10,
			alignItems: 'center'
		},
		userName: {
			color: colors.bgViolet,
			fontSize: size.label,
			fontWeight: '600'
		},
		messageTime: {
			color: colors.text,
			fontSize: size.medium,
			fontWeight: '600'
		},
		textContent: {
			color: colors.text,
			fontSize: size.medium,
			fontWeight: '600'
		},
		loadMoreChannelMessage: {
			paddingVertical: size.s_20,
			alignItems: 'center',
			justifyContent: 'center'
		}
	});

export default style;
