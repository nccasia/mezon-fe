import { useTheme } from '@mezon/mobile-ui';
import { selectLastChannelTimestamp, selectMentionAndReplyUnreadByChanneld } from '@mezon/store-mobile';
import React from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { style } from './styles';

interface IChannelBadgeUnreadProps {
	channelId: string;
	clanId: string;
}

export const ChannelBadgeUnread = React.memo(({ channelId, clanId }: IChannelBadgeUnreadProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const getLastSeenChannel = useSelector(selectLastChannelTimestamp(channelId ?? ''));
	const numberNotification = useSelector(selectMentionAndReplyUnreadByChanneld(clanId ?? '', channelId, getLastSeenChannel ?? 0)).length;

	if (numberNotification > 0) {
		return (
			<View style={styles.channelDotWrapper}>
				<Text style={styles.channelDot} numberOfLines={1}>
					{numberNotification}
				</Text>
			</View>
		);
	}
	return <View />;
});
