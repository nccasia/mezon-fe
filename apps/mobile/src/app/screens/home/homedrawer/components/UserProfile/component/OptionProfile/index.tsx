import { useTheme } from '@mezon/mobile-ui';
import { memo } from 'react';
import { Text, View } from 'react-native';
import { style } from './OptionProfile.styles';

type Option = { option: { title: string; color: string } };
const OptionProfile = memo(({ option }: Option) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	return (
		<View style={styles.wrapperOption}>
			<Text numberOfLines={1} style={[styles.textOption, { color: option.color }]}>
				{option?.title}
			</Text>
		</View>
	);
});

export default OptionProfile;
