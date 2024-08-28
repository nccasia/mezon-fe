import { Icons } from '@mezon/mobile-components';
import { Text, useTheme } from '@mezon/mobile-ui';
import { CircleXIcon } from 'libs/mobile-components/src/lib/icons2';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import { style } from './styles';

interface MezonInputProps {
	onChangeText?: (text: string) => void;
	onFocusText?: () => void;
	onBlurText?: () => void;
	hasBackground?: boolean;
	size?: 'small' | 'medium' | 'large';
	value?: string;
	isShowCancel?: boolean;
}

export default function MezonSearch({ onChangeText, onFocusText, onBlurText, hasBackground, size = 'medium', value, isShowCancel = false }: MezonInputProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const inputRef = useRef(null);
	const timeoutRef = useRef(null);
	const isFocusingBack = useRef(false);
	const { t } = useTranslation(['searchMessageChannel']);

	const handleBlurText = () => {
		if (!isFocusingBack.current) {
		  onBlurText && onBlurText()
		}
	}

	const clearTextInput = () => {
		onChangeText('');
		isFocusingBack.current = true;

		timeoutRef.current = setTimeout(() => {
			inputRef.current?.focus();
			isFocusingBack.current = false;
		}, 100);	
	};

	const handleCancelPress = () => {
		onChangeText('')
	}

	useEffect(() => {
		return () => {
			timeoutRef.current && clearTimeout(timeoutRef.current);
		};
	}, []);

	return (
		<View style={styles.container}>
			<View style={[styles.inputWrapper, { backgroundColor: hasBackground ? themeValue.primary : themeValue.secondary }]}>
				<Icons.MagnifyingIcon color={themeValue.text} height={20} width={20} />
				<TextInput 
					ref={inputRef}
					style={styles.input} 
					placeholderTextColor={themeValue.text} 
					placeholder={t('search')}
					value={value} 
					onChangeText={onChangeText} 
					onFocus={onFocusText}
					onBlur={handleBlurText}
				/>
				{!!value?.length && (
					<Pressable onPress={clearTextInput}>
						<CircleXIcon height={18} width={18} color={themeValue.text} />
					</Pressable>
				)}
			</View>
			
			{isShowCancel &&
				<TouchableOpacity onPress={handleCancelPress}>
					<Text style={styles.textCancel}>Cancel</Text>
				</TouchableOpacity>
			}
		</View>
	);
}
