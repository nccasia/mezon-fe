import { Colors, size } from '@mezon/mobile-ui';
import { appActions } from '@mezon/store-mobile';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { hasNotch } from 'react-native-device-info';
import Animated, { BounceIn } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

const NetInfoComp = () => {
	const [hasInternet, setHasInternet] = useState(false);
	const dispatch = useDispatch();
	useFocusEffect(
		useCallback(() => {
			const netInfoSubscription = NetInfo.addEventListener((state) => {
				setHasInternet(state.isConnected);
				dispatch(appActions.setHasInternetMobile(state.isConnected));
			});
			return () => {
				netInfoSubscription();
			};
		}, []),
	);

	return !hasInternet ? (
		<Animated.View entering={BounceIn.delay(400)} style={styles.container}>
			<Text style={styles.text1}>No internet connection</Text>
			<Text numberOfLines={1} style={styles.text2}>
				Please check your connection and try again
			</Text>
		</Animated.View>
	) : null;
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingVertical: 15,
		position: 'absolute',
		zIndex: 1,
		top: hasNotch() ? 60 : 20,
		marginHorizontal: 10,
		alignSelf: 'center',
		backgroundColor: 'white',
		borderRadius: 10,
		elevation: 5, // Android shadow
		shadowColor: Colors.black, // iOS shadow
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		borderStartWidth: 5,
		borderColor: Colors.textRed,
	},
	text1: { textAlign: 'left', fontSize: size.small, fontWeight: 'bold', marginBottom: 5 },
	text2: { textAlign: 'left', fontWeight: '500' },
});

export default NetInfoComp;
