import { Block, Text, ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { selectChannelMemberByUserIds, selectTypingUserIdsByChannelId } from '@mezon/store';
import LottieView from 'lottie-react-native';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TYPING_DARK_MODE, TYPING_LIGHT_MODE } from '../../../../../../assets/lottie';
import { style } from './styles';

interface IProps {
	channelId: string;
	isDM: boolean;
}

export const MessageUserTyping = React.memo(({ channelId, isDM }: IProps) => {
	const { themeValue, theme } = useTheme();
	const styles = style(themeValue);
	const typingUsersIds = useSelector(selectTypingUserIdsByChannelId(channelId));
	const typingUsers = useSelector(selectChannelMemberByUserIds(channelId, typingUsersIds || [], isDM));
	const typingLabel = useMemo(() => {
		if (typingUsers?.length === 1) {
			return `${typingUsers[0].clan_nick || typingUsers[0].user?.display_name || typingUsers[0].user?.username} is typing...`;
		}
		if (typingUsers?.length > 1) {
			return 'Several people are typing...';
		}
		return '';
	}, [typingUsers]);

	if (!typingLabel) {
		return null;
	}
	return (
		<Block flexDirection="row" alignItems="center">
			<LottieView source={theme === ThemeModeBase.DARK ? TYPING_DARK_MODE : TYPING_LIGHT_MODE} autoPlay loop style={styles.threeDot} />
			<Text style={styles.typingLabel}>{typingLabel}</Text>
		</Block>
	);
});
