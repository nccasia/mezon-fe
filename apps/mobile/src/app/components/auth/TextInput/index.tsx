import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { style } from './styles';

interface UserTextInputProps {
	placeholder: string;
	isPass: boolean;
	value: string;
	onChangeText: (text: string) => void;
	onBlur?: () => void;
	label: string;
	error: string;
	touched: boolean;
}
const TextInputUser: React.FC<UserTextInputProps> = ({ error, touched, label, placeholder, isPass, value, onChangeText, onBlur }) => {
	const { themeValue, themeBasic } = useTheme();
	const styles = style(themeValue);
	const [showPass, setShowPass] = useState<boolean>(true);

	return (
		<View style={styles.container}>
			<Text style={styles.label}>
				{label}
				<Text style={styles.require}> *</Text>
			</Text>
			<View style={styles.inputTexts}>
				<TextInput
					style={styles.inputText}
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					onBlur={onBlur}
					secureTextEntry={isPass && showPass}
					placeholderTextColor="#535353"
					autoCapitalize="none"
					keyboardAppearance={themeBasic === "dark" ? "dark" : "light"}
				/>
				{isPass && (
					<Pressable onPress={() => setShowPass(!showPass)}>
						{showPass ? <Icons.EyeIcon color={themeValue.text} /> : <Icons.EyeSlashIcon color={themeValue.text} />}
					</Pressable>
				)}
			</View>

			{touched && error && <Text style={styles.errorText}>{error}</Text>}
		</View>
	);
};

export default TextInputUser;
