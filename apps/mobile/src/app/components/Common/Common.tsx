import { size, useTheme } from '@mezon/mobile-ui';
import { View, ViewStyle } from 'react-native';
import { style } from './styles';

export const SeparatorWithSpace = () => {
	return <View style={{ height: size.s_8 }} />;
};

export const SeparatorWithLine = ({ style: additionalStyle }: { style?: ViewStyle }) => {
	const styles = style(useTheme().themeValue);
	return <View style={[styles.line, additionalStyle]} />;
};
