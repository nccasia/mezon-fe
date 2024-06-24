import { Colors, size, verticalScale } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	clansBox: {
		width: 250,
		maxHeight: 300,
		borderRadius: 10,
		backgroundColor: Colors.secondary,
	},
	serverItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 8,
		padding: size.s_6,
		marginBottom: size.s_4,
	},
	serverName: {
		flexDirection: 'row',
		gap: 10,
		alignItems: 'center',
	},
	wrapperPlusClan: {
		height: verticalScale(50),
		width: verticalScale(50),
		borderRadius: verticalScale(15),
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.tertiaryWeight,
	},
	createClan: {
		width: '100%',
		padding: size.s_4,
		paddingTop: size.s_8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: size.s_10,
		borderRadius: 8,
	},
	clanName: {
		color: Colors.white,
		fontSize: size.label,
		fontWeight: '600',
		maxWidth: 150,
	},
  clanIcon: {width: verticalScale(45), height: verticalScale(45)}
});
