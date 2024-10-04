import { useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { Text, View } from 'react-native';
import { style } from './styles';
interface FooterAuthProps {
	content: string;
	title: string;
	onPress?: () => void;
}
export const FooterAuth: React.FC<FooterAuthProps> = ({ onPress, content, title }) => {
	const styles = style(useTheme().themeValue);
	return (
		<View style={styles.signupContainer}>
			<Text style={styles.accountText}>{content} </Text>
			<Text style={styles.signupText} onPress={onPress}>
				{title}
			</Text>
		</View>
	);
};
