import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	inviteToChannelWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 50,
		backgroundColor: Colors.tertiaryWeight,
		width: 30,
		height: 30,
	},
	radioContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	radioItem: {
		width: 100,
		borderRadius: 3,
		paddingVertical: 5,
		marginRight: 10,
	},
	radioItemDeActive: {
		backgroundColor: Colors.secondary,
	},
	radioItemActive: {
		backgroundColor: Colors.bgViolet,
	},
	inviteHeader: {
		backgroundColor: Colors.secondary,
		padding: 19,
		width: '100%',
		borderTopRightRadius: 8,
		borderTopLeftRadius: 8,
	},
	inviteHeaderText: {
		color: Colors.white,
		fontWeight: 'bold',
		fontSize: 15,
	},
	inviteIconWrapper: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	shareToInviteIconWrapper: {
		height: size.s_40,
		width: size.s_40,
		borderRadius: size.s_40,
		alignSelf: 'center',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.bgGrayLight,
		overflow: 'hidden',
	},
	shareToInviteIcon: {
		color: Colors.white,
	},
	inviteIconText: {
		color: Colors.textGray,
		paddingTop: size.s_6,
	},
	searchFriendToInviteWrapper: {
		backgroundColor: Colors.tertiaryWeight,
		borderRadius: 8,
		alignItems: 'center',
		paddingHorizontal: size.s_6,
		flexDirection: 'row',
	},
	searchFriendToInviteInput: {
		width: '93%',
		borderRadius: 8,
		color: Colors.white,
		paddingVertical: 0,
		height: size.s_50,
	},
	editInviteLinkWrapper: {
		paddingTop: 17,
		flexDirection: 'row',
	},
	inviteWrapper: {
		flex: 1,
		backgroundColor: Colors.bgCharcoal,
		width: '100%',
		borderTopRightRadius: 8,
		borderTopLeftRadius: 8,
	},
	iconAreaWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 19,
		borderBottomColor: Colors.bgCharcoal,
		borderBottomWidth: 3,
	},
	searchInviteFriendWrapper: {
		padding: 19,
	},
	defaultText: {
		color: Colors.white,
	},
	linkText: {
		color: Colors.textLink,
	},
	channelInviteTitle: {
		fontSize: size.s_14,
		fontWeight: '600',
		color: Colors.tertiary,
	},
	channelInviteItem: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 19,
		borderRadius: 5,
	},
	inviteChannelListWrapper: {
		marginVertical: 15,
		paddingVertical: 20,
		borderBottomWidth: 2,
		borderTopWidth: 2,
		borderColor: Colors.borderPrimary,
		paddingHorizontal: 10,
	},
	inviteChannelListTitle: {
		color: Colors.header1,
		fontSize: 16,
		fontWeight: '500',
	},
	advancedSettingWrapper: {
		paddingLeft: 10,
		gap: 10,
	},
	advancedSettingTitle: {
		color: Colors.header1,
		fontSize: 16,
		fontWeight: '500',
	},
	advancedSettingSubTitle: {
		color: Colors.header2,
		fontSize: 16,
		fontWeight: '500',
	},
	temporaryMemberWrapper: {
		justifyContent: 'space-between',
		flexDirection: 'row',
		paddingTop: 20,
		paddingRight: 10,
	},
	temporaryMemberTitle: {
		color: Colors.textGray,
		fontSize: 16,
	},
  textUnknown: {
    textAlign: 'center',
    color: Colors.white,
    paddingHorizontal: size.s_16,
    fontSize: size.label,
    fontWeight: '600',
    marginTop: size.s_16
  }
});
