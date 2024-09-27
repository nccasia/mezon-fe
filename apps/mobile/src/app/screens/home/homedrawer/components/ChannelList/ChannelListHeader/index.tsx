import { MenuHorizontalIcon, VerifyIcon } from '@mezon/mobile-components';
import { baseColor, size, useTheme } from '@mezon/mobile-ui';
import { selectCurrentClan } from '@mezon/store-mobile';
import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { style } from './styles';

interface IProps {
	onPress: () => void;
}

const ChannelListHeader = ({ onPress }: IProps) => {
	const currentClan = useSelector(selectCurrentClan);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	function handlePress() {
		onPress && onPress();
	}

	return (
		<View style={[styles.container, { height: currentClan?.banner ? size.s_150 : size.s_70 }]}>
			{currentClan?.banner && <FastImage source={{ uri: currentClan?.banner }} style={{ flex: 1 }} resizeMode="cover" />}

			<TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.listHeader}>
				<View style={styles.titleNameWrapper}>
					<Text numberOfLines={1} style={styles.titleServer}>
						{currentClan?.clan_name}
					</Text>
					<VerifyIcon width={size.s_18} height={size.s_18} color={baseColor.blurple} />
				</View>

				<TouchableOpacity style={[styles.actions, { backgroundColor: themeValue.primary }]} onPress={handlePress}>
					<MenuHorizontalIcon height={size.s_18} width={size.s_18} color={themeValue.text} />
				</TouchableOpacity>
			</TouchableOpacity>
		</View>
	);
};

export default memo(ChannelListHeader);
