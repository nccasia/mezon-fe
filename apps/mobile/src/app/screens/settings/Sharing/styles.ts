import {Colors, horizontalScale, size} from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.secondary,
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		zIndex: 1000
	},
	container: {
		backgroundColor: Colors.secondary,
		flex: 1,
		padding: size.s_16,
		width: '100%',
	},
	header: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: size.s_30,
		paddingHorizontal: size.s_10,
		backgroundColor: Colors.secondary,
	},
	titleHeader: {
		fontSize: size.s_20,
		fontWeight: 'bold',
		color: Colors.white,
	},
	title: {
		fontSize: size.medium,
		fontWeight: '600',
		paddingBottom: size.s_20,
		color: Colors.white,
		textTransform: 'uppercase',
	},
	rowItem: {
		marginBottom: size.s_30,
	},
	inputWrapper: {
		backgroundColor: Colors.primary,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: size.s_10,
		paddingVertical: size.s_4,
		borderRadius: size.s_10,
	},
	iconLeftInput: {
		marginHorizontal: size.s_10,
		width: size.s_18,
		borderRadius: size.s_18,
		height: size.s_18,
		resizeMode: 'contain'
	},
	iconRightInput: {
		marginLeft: size.s_4,
		backgroundColor: Colors.gray72,
		padding: size.s_4,
		width: size.s_24,
		height: size.s_24,
		borderRadius: size.s_24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textInput: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 0,
		height: size.s_50,
		color: Colors.white,
	},
	textChannelSelected: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 0,
		lineHeight: size.s_50,
		color: Colors.white,
	},
	itemSuggestion: {
		paddingVertical: size.s_10,
		flexDirection: 'row',
		gap: size.s_18,
		alignItems: 'center',
	},
	logoSuggestion: {
		width: size.s_24,
		height: size.s_24,
		borderRadius: size.s_24,
		resizeMode: 'cover'
	},
	titleSuggestion: {
		fontSize: size.label,
		color: Colors.tertiary,
	},
	wrapperItemMedia: {
		width: size.s_100,
		height: size.s_100,
		borderRadius: size.s_6,
		marginRight: size.s_10
	},
	wrapperMedia: {
		padding: size.s_10,
		paddingHorizontal: size.s_4,
	},
	itemMedia: {
		width: '100%',
		height: '100%',
		borderRadius: size.s_6,
	},
	iconRemoveMedia: {
		position: 'absolute',
		backgroundColor: 'rgba(000, 000, 000, 0.5)',
		top: 2,
		right: 2,
		width: size.s_30,
		height: size.s_30,
		borderRadius: size.s_50,
		alignItems: 'center',
		justifyContent: 'center'
	},
	fileViewer: {
		gap: size.s_6,
		paddingHorizontal: size.s_10,
		maxWidth: horizontalScale(150),
		height: '100%',
		alignItems: 'center',
		borderRadius: size.s_6,
		flexDirection: 'row',
		backgroundColor: Colors.bgPrimary
	},
	fileName: {
		fontSize: size.small,
		color: Colors.white,
	},
	typeFile: {
		fontSize: size.small,
		color: Colors.textGray,
		textTransform: 'uppercase'
	},
	videoOverlay: {
		position: 'absolute',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		alignItems: 'center',
		justifyContent: 'center',
		bottom: 0,
		height: '100%',
		width: '100%',
		borderRadius: size.s_6,
	},
});
