import { IS_TABLET } from '@mezon/mobile-components';
import { Attributes, baseColor, Colors, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		mainList: {
			height: '100%',
			width: '82%',
			borderTopLeftRadius: 20,
			overflow: 'hidden',
			backgroundColor: colors.secondary
		},
		channelListSearch: {
			width: '100%',
			paddingHorizontal: 8,
			marginBottom: size.s_16,
			flexDirection: 'row',
			justifyContent: 'space-between',
			gap: size.s_8,
			alignItems: 'center'
		},
		channelListSearchWrapperInput: {
			backgroundColor: Colors.tertiaryWeight,
			flex: 1,
			borderRadius: size.s_16,
			alignItems: 'center',
			paddingHorizontal: size.s_6,
			gap: 10,
			flexDirection: 'row',
			justifyContent: 'space-between'
		},
		channelListSearchInput: {
			height: size.s_34,
			padding: 0,
			flex: 1
		},
		inviteIconWrapper: {
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 50,
			backgroundColor: colors.primary,
			width: size.s_40,
			height: size.s_40
		},
		searchBox: {
			backgroundColor: colors.primary,
			borderRadius: size.s_50,
			paddingHorizontal: IS_TABLET ? Metrics.size.l : Metrics.size.m,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			gap: Metrics.size.m,
			flexBasis: size.s_50,
			flexGrow: 1,
			paddingVertical: size.s_8
		},
		placeholderSearchBox: {
			color: colors.text,
			fontSize: size.s_14
		},
		titleEvent: {
			fontSize: size.s_14,
			color: colors.textStrong
		},
		onGoingEventTitle: {
			fontSize: size.s_18,
			fontWeight: 'bold',
			color: baseColor.green
		},
		onGoingEventPanel: {
			backgroundColor: colors.secondaryLight,
			borderRadius: size.s_12,
			padding: size.s_12,
			margin: size.s_12
		},
		detailButton: {
			backgroundColor: baseColor.green,
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: size.s_12,
			padding: size.s_8,
			borderRadius: size.s_20
		},
		titleRow: {
			flexDirection: 'row',
			gap: size.s_8,
			alignItems: 'center'
		}
	});
