import { Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { ChannelStatusEnum, IChannel } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import React, { useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ChannelBadgeUnread } from '../ChannelBadgeUnread';
import { StatusVoiceChannel } from '../ChannelListItem';
import { style } from '../ChannelListItem/styles';

interface IChannelItemProps {
	onPress: () => void;
	onLongPress: () => void;
	data: IChannel;
	isUnRead?: boolean;
	isActive?: boolean;
}

function ChannelItem({ onLongPress, onPress, data, isUnRead, isActive }: IChannelItemProps) {
	const { themeValue, theme } = useTheme();
	const styles = style(themeValue);

	const numberNotification = useMemo(() => {
		return data?.count_mess_unread ? data?.count_mess_unread : 0;
	}, [data?.count_mess_unread]);

	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={() => onPress()}
			onLongPress={onLongPress}
			style={[
				styles.channelListLink,
				isActive && styles.channelListItemActive,
				isActive && { backgroundColor: theme === 'light' ? themeValue.secondaryWeight : themeValue.secondaryLight }
			]}
		>
			<View style={[styles.channelListItem]}>
				{isUnRead && <View style={styles.dotIsNew} />}

				{data?.channel_private === ChannelStatusEnum.isPrivate && data?.type === ChannelType.CHANNEL_TYPE_VOICE && (
					<Icons.VoiceLockIcon
						width={size.s_18}
						height={size.s_18}
						color={isUnRead ? themeValue.channelUnread : themeValue.channelNormal}
					/>
				)}
				{data?.channel_private === ChannelStatusEnum.isPrivate && data?.type === ChannelType.CHANNEL_TYPE_TEXT && (
					<Icons.TextLockIcon width={size.s_18} height={size.s_18} color={isUnRead ? themeValue.channelUnread : themeValue.channelNormal} />
				)}
				{data?.channel_private !== ChannelStatusEnum.isPrivate && data?.type === ChannelType.CHANNEL_TYPE_VOICE && (
					<Icons.VoiceNormalIcon
						width={size.s_18}
						height={size.s_18}
						color={isUnRead ? themeValue.channelUnread : themeValue.channelNormal}
					/>
				)}
				{data?.channel_private !== ChannelStatusEnum.isPrivate && data?.type === ChannelType.CHANNEL_TYPE_TEXT && (
					<Icons.TextIcon width={size.s_18} height={size.s_18} color={isUnRead ? themeValue.channelUnread : themeValue.channelNormal} />
				)}
				{data?.channel_private !== ChannelStatusEnum.isPrivate && data?.type === ChannelType.CHANNEL_TYPE_STREAMING && (
					<Icons.StreamIcon height={size.s_18} width={size.s_18} color={themeValue.channelNormal} />
				)}
				{data?.channel_private !== ChannelStatusEnum.isPrivate && data?.type === ChannelType.CHANNEL_TYPE_APP && (
					<Icons.AppChannelIcon height={size.s_18} width={size.s_18} color={themeValue.channelNormal} />
				)}
				<Text style={[styles.channelListItemTitle, isUnRead && styles.channelListItemTitleActive]} numberOfLines={1}>
					{data?.channel_label}
				</Text>
			</View>
			{data?.type === ChannelType.CHANNEL_TYPE_VOICE && data?.status === StatusVoiceChannel.No_Active && (
				<ActivityIndicator color={themeValue.white} />
			)}

			{Number(numberNotification || 0) > 0 && <ChannelBadgeUnread countMessageUnread={Number(numberNotification || 0)} />}
		</TouchableOpacity>
	);
}
export default React.memo(ChannelItem);
