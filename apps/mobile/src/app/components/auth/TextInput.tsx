import { Colors, size, verticalScale } from '@mezon/mobile-ui';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

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
	const [showPass, setShowPass] = useState<boolean>(true);
	return (
		<View style={styles.container}>
			<Text style={styles.label}>
				{label}
				<Text style={{ color: 'red' }}> *</Text>
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
				/>
				{isPass && (
					<Pressable onPress={() => setShowPass(!showPass)}>
						<Entypo name={`${showPass ? 'eye' : 'eye-with-line'}`} size={24} color={'#6c6d83'} />
					</Pressable>
				)}
			</View>

			{touched && error && <Text style={styles.errorText}>{error}</Text>}
		</View>
	);
};

export default TextInputUser;

const styles = StyleSheet.create({
	container: {
		marginBottom: verticalScale(15),
	},
	label: {
		fontSize: size.s_16,
		marginTop: verticalScale(10),
		marginBottom: verticalScale(10),
		marginHorizontal: verticalScale(20),
		color: '#FFFFFF',
	},
	inputTexts: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: 50,
		borderColor: Colors.gray48,
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
		paddingLeft: 10,
		marginRight: 20,
		marginLeft: 20,
	},

	inputText: {
		fontSize: size.s_16,
		color: '#FFFFFF',
		width: '90%',
	},
	errorText: {
		fontSize: 15,
		marginTop: 10,
		marginHorizontal: 20,
		color: 'red',
	},
});
