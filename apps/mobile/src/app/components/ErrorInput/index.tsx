import { CircleExclamation } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { Text, View, ViewStyle } from 'react-native';
import { styles } from './ErrorInput.style';

export const ErrorInput = (props: { errorMessage: string , style?: ViewStyle}) => {
	return (
		<View style={[styles.errorWrapper, props?.style]}>
			<CircleExclamation width={12} height={12} color={Colors.textRed} />
			<Text style={styles.textError}>{props?.errorMessage}</Text>
		</View>
	);
};
