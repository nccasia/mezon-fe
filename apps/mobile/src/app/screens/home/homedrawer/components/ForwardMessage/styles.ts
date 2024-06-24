import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	sheetContainer: {
		overflow: 'hidden',
		backgroundColor: Colors.bgDarkCharcoal,
		alignSelf: 'center',
		borderRadius: size.s_4,
		maxHeight: '90%',
		maxWidth: '95%',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	headerModal: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
        paddingHorizontal: size.s_14,
        paddingTop: size.s_10
	},
	headerText: {
		color: Colors.white,
		fontSize: size.medium,
		textAlign: 'center',
		fontWeight: '600',
	},
	btn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.bgViolet,
		paddingVertical: 10,
		borderRadius: 50,
        marginHorizontal: size.s_10,
        marginBottom: size.s_18
	},
	btnText: {
		color: Colors.white,
	},

	inputWrapper: {
		backgroundColor: Colors.secondary,
		borderRadius: 10,
		paddingHorizontal: 15,
		marginVertical: 20,
	},

	input: {
		color: Colors.white,
		fontSize: size.small,
		paddingVertical: 0,
		height: size.s_40,
	},

	item: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
        paddingLeft: size.s_12,
        // backgroundColor: 'yellow'
	},

	memberContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 10,
        flex: 1
	},
	memberAvatar: {
		height: size.s_34,
		width: size.s_34,
		borderRadius: 50,
        backgroundColor: Colors.bgGrayDark
	},
	memberName: {
		color: Colors.white,
		fontSize: size.small,
        width: '80%'
	},
	channelItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 10,
	},
	channelName: {
		color: Colors.white,
		fontSize: size.small,
	},
    messageWrapper: {
        borderTopColor: Colors.borderPrimary,
        borderTopWidth: 1,
        minHeight: 80,
        maxHeight: 150,
    },
    searchWrapper: {
        borderBottomColor: Colors.borderPrimary,
        borderBottomWidth: 1,
        paddingHorizontal: size.s_14
    },
    typeSearch: {
        color: Colors.white,
        marginLeft: size.s_14
    },
    groupAvatar: {
        backgroundColor: Colors.bgToggleOnBtn,
        width: size.s_34,
        height: size.s_34,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
});