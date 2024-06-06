import { Colors, size, verticalScale } from '@mezon/mobile-ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Swing } from 'react-native-animated-spinkit';

type IProps = {
	isVisible: boolean;
};

const LoadingModal = ({ isVisible }: IProps) => {
	if (!isVisible) return <View />;
	return (
		<View style={styles.centeredView}>
			<Swing size={size.s_34 * 2} color={Colors.bgViolet} />
		</View>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.7)',
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
	},
	modalView: {
		backgroundColor: Colors.black,
		borderRadius: verticalScale(20),
		padding: verticalScale(20),
		alignItems: 'center',
		elevation: 5,
	},
});

export default LoadingModal;
