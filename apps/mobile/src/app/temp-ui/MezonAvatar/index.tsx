import React from 'react';
import { Image, Text, View } from 'react-native';
import { styles as s } from './styles';

interface IMezonAvatarProps {
	avatarUrl: string;
	userName: string;
	width?: number;
	height?: number;
	userStatus?: boolean;
}
const MezonAvatar = React.memo((props: IMezonAvatarProps) => {
	const { avatarUrl, userName, width = 40, height = 40, userStatus } = props;
	return (
		<View style={[s.containerItem, { height, width }]}>
			<View style={[s.boxImage, { height, width }]}>
				{avatarUrl ? (
					<Image
						style={[s.image]}
						source={{
							uri: avatarUrl,
						}}
					/>
				) : (
					<Text style={s.textAvatarMessageBoxDefault}>{userName?.charAt(0)?.toUpperCase()}</Text>
				)}
			</View>
			<View style={[s.statusCircle, userStatus ? s.online : s.offline]} />
		</View>
	);
});

export default MezonAvatar;
