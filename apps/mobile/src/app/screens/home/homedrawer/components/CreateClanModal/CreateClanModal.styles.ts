import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
import { transparent } from 'tailwindcss/colors';

export const styles = StyleSheet.create({
	headerModal: { backgroundColor: transparent },
	input: {
		height: 40,
		padding: 10,
		backgroundColor: Colors.charcoalBlack,
		borderRadius: 8,
		color: Colors.white,
		marginBottom: size.s_6,
	},
	wrapperCreateClanModal: {
		width: '100%',
		height: '100%',
		paddingHorizontal: size.s_20,
	},
	headerTitle: {
		fontSize: size.h5,
		fontWeight: '700',
		color: Colors.white,
		textAlign: 'center',
		marginBottom: size.s_8,
	},
	headerSubTitle: {
		fontSize: size.label,
		fontWeight: '400',
		color: Colors.textGray,
		textAlign: 'center',
		marginBottom: size.s_6,
	},
	uploadImage: {
		width: '100%',
		height: 150,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	uploadCreateClan: {
		width: 100,
		height: 100,
		display: 'flex',
		borderRadius: 50,
		borderStyle: 'dashed',
		borderWidth: 1,
		borderColor: Colors.white,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	addIcon: {
		position: 'absolute',
		top: 0,
		right: 0,
	},
	serverName: {
		fontSize: size.label,
		fontWeight: '600',
		color: Colors.textGray,
		marginBottom: size.s_6,
	},
	community: {
		fontSize: size.label,
		fontWeight: '500',
		color: Colors.textGray,
		marginBottom: size.s_6,
	},
	communityGuideLines: {
		color: Colors.azureBlue,
	},
	button: {
		width: '100%',
		height: 40,
		backgroundColor: Colors.bgButton,
		borderRadius: 50,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		fontSize: size.regular,
		fontWeight: '600',
		color: Colors.white,
	},
	uploadText: {
		fontSize: size.regular,
		fontWeight: '500',
		color: Colors.textGray,
	},
	overflowImage: {
		overflow: 'hidden',
	},
	image: {
		width: '100%',
		height: '100%',
		borderRadius: 50,
	},
  errorMessage: {paddingRight: size.s_20}
});
