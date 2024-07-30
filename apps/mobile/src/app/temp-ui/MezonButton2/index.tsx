import { useTheme } from '@mezon/mobile-ui';
import { useMemo } from 'react';
import { Pressable, StyleProp, Text, TextStyle } from 'react-native';
import { style } from './styles';

export enum EMezonButtonTheme {
	SUCCESS = "success",
	WARNING = "warning",
	DANGER = "danger",
	THEME = "theme",
}

export enum EMezonButtonSize {
	MD = "md",
	LG = "lg",
}
interface IMezonButton {
	icon?: any;
	title?: string;
	titleStyle?: StyleProp<TextStyle>;
	fluid?: boolean;
	border?: boolean;
	type?: EMezonButtonTheme
	size?: EMezonButtonSize
	onPress?: () => void;
}

export default function MezonButton({ icon, title, titleStyle, fluid, border, type, onPress, size = EMezonButtonSize.MD }: IMezonButton) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	const renderContainerStyle = useMemo(() => {
		switch (type) {
			case EMezonButtonTheme.SUCCESS:
				return styles.containerSuccess;
			case EMezonButtonTheme.WARNING:
				return styles.containerWarning;
			case EMezonButtonTheme.DANGER:
				return styles.containerDanger;
			case EMezonButtonTheme.THEME:
				return styles.containerTheme;
			default:
				break;
		}
	}, [type])

	const renderContainerSize = useMemo(() => {
		switch (size) {
			case EMezonButtonSize.MD:
				return styles.containerMd;
			case EMezonButtonSize.LG:
				return styles.containerLg;
			default:
				break;
		}
	}, [size])

	return (
		<Pressable style={[
			styles.container,
			fluid && styles.fluid,
			border && styles.border,
			renderContainerStyle,
			renderContainerSize]
		} onPress={onPress}>
			{icon}
			{title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
		</Pressable>
	);
}
