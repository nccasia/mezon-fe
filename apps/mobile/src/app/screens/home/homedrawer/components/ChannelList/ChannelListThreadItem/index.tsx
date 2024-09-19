import { size, useTheme } from '@mezon/mobile-ui';
import { selectIsUnreadChannelById, selectLastChannelTimestamp } from '@mezon/store';
import { selectNotificationMentionCountByChannelId } from '@mezon/store-mobile';
import { ChannelThreads } from '@mezon/utils';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import LongCornerIcon from '../../../../../../../assets/svg/long-corner.svg';
import ShortCornerIcon from '../../../../../../../assets/svg/short-corner.svg';
import { style } from './styles';

interface IChannelListThreadItemProps {
	onPress?: (thread: any) => void;
	onLongPress?: (thread: ChannelThreads) => void;
	thread: any;
	isActive?: boolean;
	isFirstThread?: boolean;
}

function useChannelBadgeCount(channelId: string) {
	const lastChannelTimestamp = useSelector(selectLastChannelTimestamp(channelId));
	const numberNotification = useSelector(selectNotificationMentionCountByChannelId(channelId, lastChannelTimestamp));

	return numberNotification;
}

export default function ChannelListThreadItem({ onPress, onLongPress, thread, isActive, isFirstThread }: IChannelListThreadItemProps) {
	const { themeValue, theme } = useTheme();
	const styles = style(themeValue);

	const isUnReadChannel = useSelector(selectIsUnreadChannelById(thread.id));
	const numberNotification = useChannelBadgeCount(thread.id);

	const onPressThreadItem = () => {
		onPress && onPress(thread);
	};

	const onLongPressThreadItem = () => {
		onLongPress && onLongPress(thread);
	};

	return (
		<TouchableOpacity
			key={thread.id}
			activeOpacity={1}
			onPress={() => onPressThreadItem()}
			onLongPress={() => onLongPressThreadItem()}
			style={[styles.channelListLink]}
		>
			<View style={[styles.threadItem]}>
				{isActive && (
					<View
						style={[
							styles.threadItemActive,
							isFirstThread && styles.threadFirstItemActive,
							{ backgroundColor: theme === 'light' ? themeValue.secondaryWeight : themeValue.secondaryLight }
						]}
					/>
				)}
				{isFirstThread ? <ShortCornerIcon /> : <LongCornerIcon />}
				<Text style={[styles.titleThread, isUnReadChannel && styles.channelListItemTitleActive]} numberOfLines={1}>
					{thread?.channel_label}
				</Text>
			</View>

			{numberNotification > 0 && (
				<View style={[styles.channelDotWrapper, isFirstThread && { top: size.s_6 }]}>
					<Text style={styles.channelDot}>{numberNotification}</Text>
				</View>
			)}
		</TouchableOpacity>
	);
}
