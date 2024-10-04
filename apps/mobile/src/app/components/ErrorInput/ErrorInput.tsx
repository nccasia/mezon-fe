import { CircleExclamation } from '@mezon/mobile-components';
import { Colors, size } from '@mezon/mobile-ui';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { styles } from './ErrorInput.style';

type ErrorInputProps = { errorMessage: string; style?: ViewStyle; isShowIcon?: boolean; textErrorStyle?: TextStyle };

export const ErrorInput = (props: ErrorInputProps) => {
	const { errorMessage, style, isShowIcon = true, textErrorStyle } = props;
	return (
		<View style={[styles.errorWrapper, style]}>
			{isShowIcon && <CircleExclamation width={size.s_12} height={size.s_12} color={Colors.textRed} />}
			<Text style={[styles.textError, textErrorStyle]}>{errorMessage}</Text>
		</View>
	);
};
