import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useTheme } from '@mezon/mobile-ui';
import { Text, View } from 'react-native';
import { style } from './styles';

interface IMezonButtonIconProps {
	onPress?: () => void;
	icon: any;
	title: string;
}

export default function MezonButtonIcon({ title, icon, onPress }: IMezonButtonIconProps) {
	const styles = style(useTheme().themeValue);
	return (
		<TouchableOpacity onPress={onPress} style={styles.container}>
			<View style={styles.iconWrapper}>{icon}</View>
			<Text style={styles.title}>{title}</Text>
		</TouchableOpacity>
	);
}
