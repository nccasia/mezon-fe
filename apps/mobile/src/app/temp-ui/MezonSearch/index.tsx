import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { TextInput, View } from 'react-native';
import { style } from './styles';

interface MezonInputProps {
	onChangeText?: (text: string) => void;
	hasBackground?: boolean;
	size?: 'small' | 'medium' | 'large';
	value?: string;
}

export default function MezonSearch({ onChangeText, hasBackground, size = 'medium', value }: MezonInputProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View style={[styles.inputWrapper, { backgroundColor: hasBackground ? themeValue.primary : themeValue.secondary }]}>
			<Icons.MagnifyingIcon color={themeValue.text} height={20} width={20} />
			<TextInput 
				style={styles.input} 
				placeholderTextColor={themeValue.text} 
				placeholder="Search" 
				value={value} 
				onChangeText={onChangeText} 
			/>
		</View>
	);
}
