import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	containerItem: {
		position: 'relative',
		width: '100%',
		height: '100%',
		backgroundColor: Colors.bgCharcoal,
		borderRadius: size.s_10,
		overflow: 'hidden'
	},
	boxAvatar: {
		position: 'absolute',
		top: size.s_8,
		zIndex: 1,
		right: size.s_8,
		borderRadius: size.s_50,
		borderWidth: 1,
		borderColor: Colors.secondary
	},
	image: { width: '100%', height: '100%' },
	video: {
		width: '100%',
		height: '100%',
		borderRadius: size.s_4,
		overflow: 'hidden'
	}
});

export default styles;
