import { size, useTheme } from "@mezon/mobile-ui";
import { CircleXIcon } from "libs/mobile-components/src/lib/icons2";
import { useEffect, useRef, useState } from "react";
import { StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ErrorInput } from "../../components/ErrorInput";
import { validInput } from "../../utils/validate";
import { style } from "./styles";

interface IMezonInputProps {
	placeHolder?: string;
	label?: string;
	titleStyle?: StyleProp<TextStyle>,
	titleUppercase?: boolean
	textarea?: boolean;
	value: string;
	onTextChange?: (value: string) => void;
	maxCharacter?: number,
	inputWrapperStyle?: StyleProp<ViewStyle>,
	showBorderOnFocus?: boolean,
	errorMessage?: string;
}

export default function MezonInput({ placeHolder, label, textarea, value, onTextChange, maxCharacter = 60, inputWrapperStyle, showBorderOnFocus, errorMessage, titleUppercase, titleStyle }: IMezonInputProps) {
	const { themeValue, themeBasic } = useTheme();
	const styles = style(themeValue);
	const ref = useRef<TextInput>(null);
	const [showCount, setShowCount] = useState<boolean>(false);
	const [isFocus, setFocus] = useState<boolean>(false);
	const [isCheckValid, setIsCheckValid] = useState<boolean>(true);

	useEffect(() => {
		setIsCheckValid(validInput(value));
	}, [value]);

	function handleClearBtn() {
		ref && ref.current && ref.current.clear();
		onTextChange && onTextChange('');
	}

	function handleFocus() {
		setShowCount(true);
		setFocus(true);
	}

	function handleBlur() {
		setShowCount(false);
		setFocus(false);
	}

	const renderBorder = (): StyleProp<ViewStyle> => {
		if (showBorderOnFocus) {
			return isFocus ? styles.fakeInputFocus : styles.fakeInputBlur;
		} else {
			return {};
		}
	};

	return (
		<View style={styles.container}>
			<Text style={[styles.label, titleUppercase ? styles.titleUppercase : {}, titleStyle]}>{label}</Text>
			<View style={[styles.fakeInput, textarea && { paddingTop: 10 }, renderBorder(), inputWrapperStyle]}>
				<View style={styles.inputBox}>
					<TextInput
						ref={ref}
						value={value}
						onChangeText={onTextChange}
						multiline={textarea}
						numberOfLines={textarea ? 4 : 1}
						textAlignVertical={textarea ? 'top' : 'center'}
						maxLength={maxCharacter}
						style={[styles.input, textarea && { height: size.s_100 }]}
						placeholder={placeHolder}
						placeholderTextColor="gray"
						onFocus={handleFocus}
						onBlur={handleBlur}
						keyboardAppearance={themeBasic === "dark" ? "dark" : "light"}
					/>

					{!textarea && value?.length > 0 && (
						<TouchableOpacity onPress={handleClearBtn} style={styles.clearBtn}>
							<CircleXIcon height={18} width={18} color={themeValue.text} />
						</TouchableOpacity>
					)}
				</View>

				{showCount && textarea && (
					<View style={styles.lineCountWrapper}>
						<Text style={styles.count}>{`${value?.length || '0'}/${maxCharacter}`}</Text>
					</View>
				)}
			</View>
			{!isCheckValid && errorMessage && <ErrorInput style={styles.errorInput} errorMessage={errorMessage} />}
		</View>
	);
}
