import { useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { View } from 'react-native';
import MezonClanAvatar from '../MezonClanAvatar';
import { style } from './styles';

interface IMezonAvatarProps {
	avatarUrl: string;
	username: string;
	width?: number;
	height?: number;
	userStatus?: boolean;
	isBorderBoxImage?: boolean;
}
const MezonAvatar = React.memo((props: IMezonAvatarProps) => {
	const { themeValue } = useTheme();
	const { avatarUrl, username, width = 40, height = 40, userStatus, isBorderBoxImage } = props;
	const styles = style(themeValue, height, width);

	return (
		<View style={[styles.containerItem, { height, width }]}>
			<View style={[styles.boxImage, { height, width }, isBorderBoxImage && styles.borderBoxImage]}>
				<MezonClanAvatar
					alt={username}
					image={avatarUrl}
				/>
			</View>

			{userStatus && <View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />}
		</View>
	);
});

export default MezonAvatar;
