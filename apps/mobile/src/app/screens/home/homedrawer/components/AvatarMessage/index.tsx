import { Text, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { Pressable, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { style } from './styles';

interface IProps {
	onPress: () => void;
	avatar: string;
	textAvatar: string;
	isShow: boolean;
}
export const AvatarMessage = React.memo(({ isShow, onPress, avatar, textAvatar }: IProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	if (isShow) {
		return (
			<Pressable onPress={onPress} style={styles.wrapperAvatar}>
				{avatar ? (
					<FastImage source={{ uri: avatar }} style={styles.logoUser} />
				) : (
					<View style={styles.avatarMessageBoxDefault}>
						<Text style={styles.textAvatarMessageBoxDefault}>{textAvatar?.charAt(0)?.toUpperCase() || 'A'}</Text>
					</View>
				)}
			</Pressable>
		);
	}

	return <View style={styles.wrapperAvatarCombine} />;
});
