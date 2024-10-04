import { AppleIcon, GoogleIcon } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { style } from './styles';

export const LoginSocial = ({ onGoogleButtonPress, onAppleButtonPress }: any) => {
	const styles = style(useTheme().themeValue);

	return (
		<Block gap={size.s_20}>
			{Platform.OS === 'ios' && (
				<TouchableOpacity style={styles.appleButton} onPress={onAppleButtonPress}>
					<View style={styles.socialButtonsContainer}>
						<AppleIcon width={size.s_18} height={size.s_18} />
						<Text style={[styles.socialSigninButtonText, { color: 'white' }]}>Continue with Apple</Text>
					</View>
				</TouchableOpacity>
			)}
			<TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
				<View style={styles.socialButtonsContainer}>
					<GoogleIcon width={size.s_18} height={size.s_18} color={'#155EEF'} />
					<Text style={styles.socialSigninButtonText}>Continue with Google</Text>
				</View>
			</TouchableOpacity>
		</Block>
	);
};
