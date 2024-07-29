import { useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View, ViewStyle } from 'react-native';
import { style } from './style';

interface IMezonButtonProps extends TouchableOpacityProps {
	children: React.ReactNode | string;
	disabled?: boolean;
	onPress?: () => void;
	viewContainerStyle?: ViewStyle | ViewStyle[];
	textStyle?: ViewStyle | ViewStyle[];
}

export const MezonButton = (props: IMezonButtonProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { children, textStyle, disabled, viewContainerStyle, onPress } = props;
	const isString = typeof children === 'string';

	return (
		<TouchableOpacity disabled={disabled} style={styles.fill} onPress={onPress} {...props}>
			<View style={[styles.buttonWrapper, disabled && styles.disable, viewContainerStyle]}>
				{isString
					? <Text style={[styles.text, textStyle]}>{children}</Text>
					: children
				}
			</View>
		</TouchableOpacity>
	);
};
