import { Colors, Metrics } from '@mezon/mobile-ui';
import React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import LogoMezon from '../../../assets/svg/logoMezon.svg';

const SplashScreen = () => {
	const rotation = React.useRef(new Animated.Value(0)).current;
	const bounceValue = React.useRef(new Animated.Value(1)).current;

	React.useEffect(() => {
		const rotationAnimation = Animated.loop(
			Animated.timing(rotation, {
				toValue: 1,
				duration: 2000,
				easing: Easing.linear,
				useNativeDriver: true,
			}),
		);

		const bounceAnimation = Animated.loop(
			Animated.sequence([
				Animated.timing(bounceValue, {
					toValue: 1.2,
					duration: 1500,
					easing: Easing.bounce,
					useNativeDriver: true,
				}),
				Animated.timing(bounceValue, {
					toValue: 1,
					duration: 1500,
					easing: Easing.bounce,
					useNativeDriver: true,
				}),
			]),
		);

		rotationAnimation.start();
		bounceAnimation.start();

		return () => {
			rotationAnimation.stop();
			bounceAnimation.stop();
		};
	}, []);
	const spin = rotation.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	return (
		<View style={styles.container}>
			<Animated.View style={{ transform: [{ rotate: spin }, { scale: bounceValue }] }}>
				<LogoMezon width={90} height={90} />
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: Metrics.screenWidth,
		height: Metrics.screenHeight,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.secondary,
		zIndex: 1000,
	},
});

export default SplashScreen;
