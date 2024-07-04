import { ArrowLeftIcon, HashSignIcon, HashSignLockIcon, UserGroupIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { ChannelStatusEnum } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import { memo, useContext, useMemo } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { threadDetailContext } from '../MenuThreadDetail';
import { styles } from './styles';
import { useMemberStatus } from '@mezon/core';

export const ThreadHeader = memo(() => {
	const currentChannel = useContext(threadDetailContext);
	const isDMThread = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
	}, [currentChannel]);
	const userStatus = useMemberStatus(currentChannel?.user_id?.length === 1 ? currentChannel?.user_id[0] : '');
	const navigation = useNavigation<any>();
	return (
		<View style={styles.channelLabelWrapper}>
			<TouchableOpacity style={styles.iconBackHeader} onPress={() => navigation.goBack()}>
				<ArrowLeftIcon />
			</TouchableOpacity>
			{isDMThread ? (
				<View style={styles.avatarWrapper}>
					<View>
						{currentChannel?.channel_avatar?.length > 1 ? (
							<View style={[styles.groupAvatar, styles.avatarSize]}>
								<UserGroupIcon />
							</View>
						) : (
							<View style={styles.avatarSize}>
								<Image source={{ uri: currentChannel.channel_avatar[0] }} style={[styles.friendAvatar, styles.avatarSize]} />
								<View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
							</View>
						)}
					</View>
					<Text numberOfLines={1} style={styles.channelLabel}>
						{currentChannel?.channel_label}
					</Text>
				</View>
			) : (
				<View style={styles.channelText}>
					{currentChannel?.channel_private === ChannelStatusEnum.isPrivate && currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT ? (
						<HashSignLockIcon width={20} height={20} color={Colors.white} />
					) : (
						<HashSignIcon width={18} height={18} />
					)}
					<Text numberOfLines={1} style={styles.channelLabel}>
						{currentChannel?.channel_label}
					</Text>
				</View>
			)}
		</View>
	);
});
