import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		wrapper: {
			width: '100%',
			height: '100%'
		},
		userAvatar: {
			position: 'absolute',
			bottom: '-25%',
			paddingLeft: size.s_14
		},
		backdrop: {
			height: 120,
			position: 'relative',
			marginBottom: size.s_20
		},
		container: {
			paddingHorizontal: size.s_14,
			marginTop: size.s_30
		},
		userInfo: {
			backgroundColor: colors.secondary,
			marginBottom: size.s_20,
			padding: size.s_16,
			borderRadius: 8
		},
		roleGroup: {
			backgroundColor: colors.secondary,
			marginBottom: size.s_20,
			borderRadius: 8,
			padding: size.s_20
		},
		userName: {
			color: colors.textStrong,
			fontSize: size.h6,
			fontWeight: '600'
		},
		subUserName: {
			color: colors.text,
			fontSize: size.medium,
			fontWeight: '400'
		},
		userAction: {
			marginTop: size.s_20,
			gap: size.s_20,
			flexDirection: 'row',
			alignItems: 'center'
			// justifyContent: 'space-between',
		},
		actionItem: {
			flexDirection: 'column',
			alignItems: 'center',
			padding: size.s_10,
			gap: size.s_6,
			backgroundColor: colors.primary,
			borderRadius: 8
		},
		actionText: {
			color: colors.text,
			fontSize: size.medium
		},
		aboutMe: {
			color: colors.textStrong,
			fontSize: size.label,
			fontWeight: '600',
			marginBottom: size.s_10
		},
		aboutMeText: {
			color: colors.text,
			fontSize: size.medium,
			fontWeight: '500',
			marginBottom: size.s_10,
			fontStyle: 'italic'
		},
		roles: {
			flexDirection: 'row',
			gap: size.s_10,
			flexWrap: 'wrap'
		},
		roleItem: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			backgroundColor: colors.charcoal,
			minWidth: 80,
			padding: size.s_6,
			borderRadius: 8
		},
		textRole: {
			color: colors.white,
			fontSize: size.medium,
			fontWeight: '400'
		},
		title: {
			color: colors.white,
			fontSize: size.label,
			fontWeight: '600',
			marginBottom: size.s_10
		},
		customStatusText: {
			color: colors.text,
			fontSize: size.medium,
			fontWeight: '400'
		},
		defaultText: {
			color: colors.white,
			textAlign: 'center'
		},
		button: {
			flex: 1,
			paddingVertical: size.s_6,
			borderRadius: size.s_2
		},
		receivedFriendRequestTitle: {
			color: colors.text,
			fontSize: size.h7,
			fontWeight: 'bold'
		}
	});
