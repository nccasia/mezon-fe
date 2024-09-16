import { useTheme } from '@mezon/mobile-ui';
import { selectAllChannelMembers, selectMemberClanByUserId, useAppSelector } from '@mezon/store-mobile';
import React, { useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { style } from '../styles';

interface IReactionMemberProps {
	userId: string;
	onSelectUserId: (userId: string) => void;
	channelId?: string;
}

export const ReactionMember = React.memo((props: IReactionMemberProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { userId, onSelectUserId, channelId } = props;
	const channelMemberList = useAppSelector((state) => selectAllChannelMembers(state, channelId || ''));
	const user = useSelector(selectMemberClanByUserId(userId || ''));

	const reactionMember = useMemo(() => {
		if (user) {
			return user;
		}
		return channelMemberList?.find((member) => member?.id === userId);
	}, [user, channelMemberList, userId]);

	const showUserInformation = () => {
		onSelectUserId(userId);
	};

	return (
		<TouchableOpacity style={styles.memberWrapper} onPress={showUserInformation}>
			<View style={styles.imageWrapper}>
				{reactionMember?.user?.avatar_url ? (
					<View>
						<Image source={{ uri: reactionMember?.user?.avatar_url }} resizeMode="cover" style={styles.image} />
					</View>
				) : (
					<View style={styles.avatarBoxDefault}>
						<Text style={styles.textAvatarBoxDefault}>{reactionMember?.user?.username?.charAt(0)?.toUpperCase()}</Text>
					</View>
				)}
			</View>
			<Text style={styles.memberName}>{reactionMember?.user?.display_name}</Text>
			{reactionMember?.user?.username ? <Text style={styles.mentionText}>@{reactionMember?.user?.username}</Text> : null}
		</TouchableOpacity>
	);
});
