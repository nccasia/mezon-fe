import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	reactionWrapper: {
		paddingTop: size.s_6,
		flexDirection: 'row',
		gap: size.s_6,
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	myReaction: {
		borderWidth: 1,
		borderColor: Colors.bgViolet,
	},
	otherReaction: {
		backgroundColor: Colors.bgCharcoal,
	},
	reactItem: {
		flexDirection: 'row',
		gap: size.s_2,
		padding: size.s_2,
		borderRadius: 5,
	},
	reactCount: {
		color: Colors.white,
	},
	bottomSheetWrapper: {
		flex: 1,
		backgroundColor: Colors.bgCharcoal,
		width: '100%',
		borderTopRightRadius: 8,
		borderTopLeftRadius: 8,
	},
	tabHeaderWrapper: {
		width: '100%',
		flexDirection: 'row',
	},
	contentHeader: {
		width: '100%',
		padding: size.s_10,
		borderBottomWidth: 2,
		borderBottomColor: Colors.borderPrimary,
		maxHeight: 60,
	},
	tabHeaderItem: {
		padding: size.s_4,
		flexDirection: 'row',
		alignItems: 'center',
		gap: size.s_4,
		borderRadius: 8,
		marginRight: 7,
	},
	activeTab: {
		backgroundColor: Colors.secondary,
	},
	originEmojiColor: {
		color: Colors.white,
	},
	emojiTab: {
		fontSize: size.input,
	},
	headerTabCount: {
		fontSize: size.label,
	},
	contentWrapper: {
		padding: size.s_12,
		gap: size.s_10,
	},
	avatarBoxDefault: {
		width: '100%',
		height: '100%',
		borderRadius: size.s_50,
		backgroundColor: Colors.titleReset,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textAvatarBoxDefault: {
		fontSize: size.s_22,
		color: Colors.white,
	},
	memberWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: size.s_10,
	},
	imageWrapper: {
		width: size.s_40,
		height: size.s_40,
		borderRadius: size.s_40,
		overflow: 'hidden',
	},
	memberName: {
		marginLeft: size.s_12,
		color: Colors.white,
	},
	mentionText: {
		color: Colors.bgGrayDark,
	},
	addEmojiIcon: {
		width: size.s_20,
		height: size.s_20,
	},
	iconEmojiReaction: {
		width: size.s_20,
		height: size.s_20,
		marginRight: size.s_2,
	},
	iconEmojiReactionDetail: {
		width: size.s_24,
		height: size.s_24,
		padding: size.s_2,
	},
	removeEmojiContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 30,
	},
	confirmDeleteEmoji: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.red,
		paddingVertical: size.s_8,
		paddingHorizontal: size.s_14,
		gap: size.s_6,
		borderRadius: 50
	},
	confirmText: {
		color: Colors.white,
		fontSize: size.label
	},
	emojiText: {
		color: Colors.tertiary,
		fontSize: size.label
	},
	noActionsWrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	noActionTitle: {
		color: Colors.white,
		fontSize: size.h6
	},
	noActionContent: {
		color: Colors.textGray,
		fontSize: size.medium
	}
});
