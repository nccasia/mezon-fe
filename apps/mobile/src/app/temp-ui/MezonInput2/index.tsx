import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ErrorInput } from '../../components/ErrorInput';
import styles from './styles';
import { validInput } from '../../utils/validate';

interface IMezonInput2 {
	placeHolder?: string;
	label?: string;
	errorMessage?: string;
	value: string;
	onTextChange?: (value: string) => void;
}

export default function MezonInput({ label, placeHolder, value, onTextChange, errorMessage }: IMezonInput2) {
  const [isCheckValid, setIsCheckValid] = useState<boolean>(true);
  useEffect(()=>{
    setIsCheckValid(validInput(value))
  },[value])
	return (
		<View>
			<Text style={styles.label}>{label}</Text>
			<TextInput placeholderTextColor={'gray'} placeholder={placeHolder} style={styles.input} value={value} onChangeText={onTextChange} />
			{!isCheckValid && errorMessage && <ErrorInput style={styles.errorInput} errorMessage={errorMessage} />}
		</View>
	);
}
