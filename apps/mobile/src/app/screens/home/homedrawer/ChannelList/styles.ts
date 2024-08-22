import { Attributes, baseColor, Colors, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		mainList: {
			height: '100%',
			width: '82%',
			borderTopLeftRadius: 20,
			overflow: 'hidden',
			backgroundColor: colors.secondary,
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
			justifyContent: 'space-between',
		},
		channelListSearchInput: {
			height: size.s_34,
			padding: 0,
			flex: 1,
		},
		inviteIconWrapper: {
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 50,
			backgroundColor: colors.primary,
			width: 40,
			height: 40,
		},
		searchBox: {
			backgroundColor: colors.primary,
			borderRadius: size.s_50,
			paddingHorizontal: Metrics.size.m,
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
			fontSize: size.s_14,
		},
    newNotifyPopup: {
      backgroundColor: baseColor.redStrong,
      position: 'absolute',
      paddingHorizontal: size.s_14,
      paddingVertical: size.s_6,
      borderRadius: size.s_20,
      bottom: size.s_20,
      left: '40%',
    },
    newNotifyText: {
      fontSize: size.s_14,
      fontWeight: '600',
      color: colors.white,
      textAlign: 'center'
    }
	});
