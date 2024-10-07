import { useTheme } from '@mezon/mobile-ui';
import { ReactNode } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { style } from './styles';

export interface IMezonMenuContextItemProps {
	containerStyle?: StyleProp<ViewStyle>;
	hasBorder?: boolean;
	isHeader?: boolean;
	icon?: ReactNode;
	title: string;
	titleStyle?: StyleProp<TextStyle>;
	disabled?: boolean;
	onPress?: () => void;
}

export default function MezonMenuContextItem({
	hasBorder,
	isHeader,
	icon,
	title,
	titleStyle,
	onPress,
	containerStyle,
	disabled
}: IMezonMenuContextItemProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			style={[styles.container, hasBorder && styles.border, isHeader && styles.header, containerStyle]}
		>
			<View>
				<Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, isHeader && styles.textHeader, titleStyle]}>
					{title}
				</Text>
				{icon}
			</View>
		</TouchableOpacity>
	);
}
