import { useTheme } from '@mezon/mobile-ui';
import { ReactNode } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { style } from './styles';

export interface IMezonFakeBoxProps {
	title?: string;
	titleStyle?: StyleProp<TextStyle>;
	titleUppercase?: boolean;
	prefixIcon?: ReactNode;
	postfixIcon?: ReactNode;
	value: string;
	onPress?: () => void;
}

export default function MezonFakeInputBox({ title, titleStyle, titleUppercase, prefixIcon, postfixIcon, value, onPress }: IMezonFakeBoxProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	return (
		<View>
			{title && <Text style={[styles.sectionTitle, titleUppercase ? styles.titleUppercase : {}, titleStyle]}>{title}</Text>}

			<TouchableOpacity onPress={onPress}>
				<View style={styles.box}>
					{prefixIcon}
					<Text style={styles.textBox}>{value}</Text>
					{postfixIcon}
				</View>
			</TouchableOpacity>
		</View>
	);
}
