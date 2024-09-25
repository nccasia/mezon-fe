import { IOptionSearchProps } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { Text, TouchableOpacity, View } from 'react-native';
import { style } from './OptionSearch.styles';

const OptionSearch = ({ option, onSelect }: IOptionSearchProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<TouchableOpacity onPress={() => onSelect(option)}>
			<View style={styles.wrapperOption}>
				<View style={styles.content}>
					<Text numberOfLines={1} ellipsizeMode="tail" style={styles.textOption}>
						{option?.title}
					</Text>
					<Text numberOfLines={1} ellipsizeMode="tail" style={styles.textOption}>
						{option?.content}
					</Text>
				</View>
				{option?.icon}
			</View>
		</TouchableOpacity>
	);
};

export default OptionSearch;
