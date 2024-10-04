import { Dimensions, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexGrow: 1,
		flexBasis: 500,
		overflow: 'hidden'
	},
	widthTab: { width: Dimensions.get('window').width }
});

export default styles;
