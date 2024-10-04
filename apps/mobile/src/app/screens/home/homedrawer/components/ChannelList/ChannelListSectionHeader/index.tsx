import { Icons, SortIcon } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { style } from './styles';

interface IChannelListSectionHeaderProps {
	title: string;
	onPress: any;
	onLongPress: () => void;
	isCollapsed: boolean;
	onPressSortChannel: () => void;
}

const ChannelListSectionHeader = ({ onPress, title, onLongPress, onPressSortChannel, isCollapsed }: IChannelListSectionHeaderProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<TouchableOpacity activeOpacity={0.8} onPress={onPress} onLongPress={onLongPress} style={styles.channelListHeader}>
			<View style={styles.channelListHeaderItem}>
				<Icons.ChevronSmallDownIcon
					width={size.s_20}
					height={size.s_20}
					color={themeValue.text}
					style={[isCollapsed && { transform: [{ rotate: '-90deg' }] }]}
				/>
				<Text style={styles.channelListHeaderItemTitle}>{title}</Text>

				<TouchableOpacity onPress={onPressSortChannel} style={styles.sortButton}>
					<SortIcon width={size.s_20} height={size.s_20} color={themeValue.text} />
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);
};
export default memo(ChannelListSectionHeader);
