import { CircleExclamation } from '@mezon/mobile-components';
import { Colors, size } from '@mezon/mobile-ui';
import { Text, View, ViewStyle } from 'react-native';
import { styles } from './ErrorInput.style';

export const ErrorInput = (props: { errorMessage: string; style?: ViewStyle }) => {
	return (
		<View style={[styles.errorWrapper, props?.style]}>
			<CircleExclamation width={size.s_12} height={size.s_12} color={Colors.textRed} />
			<Text style={styles.textError}>{props?.errorMessage}</Text>
		</View>
	);
};
