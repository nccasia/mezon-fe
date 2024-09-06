import { Attributes, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		channelListHeader: {
			width: '100%',
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginBottom: Metrics.size.m
		},

		channelListHeaderItem: {
			flexDirection: 'row',
			alignItems: 'center',
			flex: 1
		},

		channelListHeaderItemTitle: {
			textTransform: 'uppercase',
			fontSize: size.s_14,
			fontWeight: 'bold',
			color: colors.text
		},

		sortButton: {
			paddingHorizontal: size.s_14,
			paddingTop: size.s_8,
			paddingBottom: size.s_6,
			marginLeft: 'auto'
		}
	});
