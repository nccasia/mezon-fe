import { useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { Text, View } from 'react-native';
import { style } from './styles';

interface IChannelBadgeUnreadProps {
	countMessageUnread: number;
}

export const ChannelBadgeUnread = React.memo(({ countMessageUnread }: IChannelBadgeUnreadProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View style={styles.channelDotWrapper}>
			<Text style={styles.channelDot} numberOfLines={1}>
				{countMessageUnread}
			</Text>
		</View>
	);
});
