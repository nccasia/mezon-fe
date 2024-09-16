import { size, useTheme } from '@mezon/mobile-ui';
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
	stacks?: {
		avatarUrl: string;
		username: string;
	}[],
	isShow?: boolean;
}
const MezonAvatar = React.memo((props: IMezonAvatarProps) => {
	const { themeValue } = useTheme();
	const { avatarUrl, username, width = size.s_40, height = size.s_40, userStatus, isBorderBoxImage, stacks, isShow = true } = props;
	const styles = style(themeValue, height, width, stacks?.length);

	if (!isShow) return (
		<View style={{ height, width }}></View>
	)

	if (stacks) {
		return (
			<View style={styles.listImageFriend}>
				{stacks.map((user, idx) => {
					return (
						<View key={idx} style={[
							styles.imageContainer,
							styles.borderBoxImage,
							{ height, width }, { right: idx * 20 }
						]}>
							<MezonClanAvatar
								alt={user.username}
								image={user.avatarUrl}
								lightMode
							/>
						</View>
					);
				})}
			</View>
		);
	}

	return (
		<View style={[styles.containerItem, { height, width }]}>
			<View style={[styles.boxImage, { height, width }, isBorderBoxImage && styles.borderBoxImage]}>
				<MezonClanAvatar
					alt={username}
					image={avatarUrl}
					lightMode
				/>
			</View>

			{!!userStatus && <View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />}
		</View>
	);
});

export default MezonAvatar;
