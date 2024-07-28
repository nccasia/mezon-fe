import { Text, useTheme } from '@mezon/mobile-ui';
import { selectChannelMemberByUserIds, selectTypingUserIdsByChannelId } from '@mezon/store';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { style } from './styles';

interface IProps {
	channelId: string;
}

export const MessageUserTyping = React.memo(({ channelId }: IProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const typingUsersIds = useSelector(selectTypingUserIdsByChannelId(channelId));
	const typingUsers = useSelector(selectChannelMemberByUserIds(channelId, typingUsersIds || []));
	const typingLabel = useMemo(() => {
		if (typingUsers?.length === 1) {
			return `${typingUsers?.[0]?.user?.username} is typing...`;
		}
		if (typingUsers?.length > 1) {
			return 'Several people are typing...';
		}
		return '';
	}, [typingUsers]);

	if (!typingLabel) {
		return null;
	}
	return <Text style={styles.typingLabel}>{typingLabel}</Text>;
});
