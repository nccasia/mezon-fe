import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
interface ButtonProps {
	isValid: boolean;
	onPress: () => void;
	title: string;
	disabled: boolean;
	loading: boolean;
}
const Button: React.FC<ButtonProps> = ({ isValid, onPress, title, disabled, loading }) => {
	// const loading = useSelector(state => state?.auth?.loading);
	return (
		<Pressable style={[styles.button, { backgroundColor: isValid ? '#155EEF' : '#A5C9CA' }]} disabled={loading || disabled} onPress={onPress}>
			{loading ? (
				<View style={styles.wrapperLoading}>
					<Text style={styles.signinButtonText}>Loading</Text>
					<ActivityIndicator color={'white'} />
				</View>
			) : (
				<Text style={styles.signinButtonText}>{title}</Text>
			)}
		</Pressable>
	);
};

export default Button;

const styles = StyleSheet.create({
	button: {
		borderRadius: 8,
		marginHorizontal: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		height: 50,
	},
	signinButtonText: {
		fontSize: 18,
		lineHeight: 18 * 1.4,
		color: '#FFFFFF',
	},
	wrapperLoading: {
		flexDirection: 'row',
		gap: 8,
	},
});
