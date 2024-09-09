import { AngleRightIcon } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { ChannelsEntity, channelsActions, getStoreAsync, selectMemberClanByUserId } from '@mezon/store-mobile';
import { IChannel, IChannelMember, convertTimeMessage } from '@mezon/utils';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useMessageSender } from '../../../hooks/useMessageSender';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { style } from './ThreadItem.style';

interface IThreadItemProps {
	thread: ChannelsEntity;
}
const ThreadItem = ({ thread }: IThreadItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const navigation = useNavigation();
	const user = useSelector(selectMemberClanByUserId(thread?.last_sent_message?.sender_id as string)) as unknown as IChannelMember;

	const { username } = useMessageSender(user);
	const handleNavigateThread = async (thread?: IChannel) => {
		const store = await getStoreAsync();
		navigation.navigate(APP_SCREEN.HOME as never);
		navigation.dispatch(DrawerActions.closeDrawer());
		const channelId = thread?.channel_id;
		const clanId = thread?.clan_id;
		store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
	};
	const timeMessage = useMemo(() => {
		if (thread && thread.last_sent_message && thread.last_sent_message.timestamp_seconds) {
			const lastTime = convertTimeMessage(thread.last_sent_message.timestamp_seconds);
			return lastTime;
		}
	}, [thread]);
	let lastSentMessage = '';
	try {
		const lastSentMessageContent = thread?.last_sent_message?.content ? JSON.parse(thread?.last_sent_message?.content) : {};
		lastSentMessage = lastSentMessageContent?.t || '';
	} catch (error) {
		console.error('JSON parse error:', error);
	}

	return (
		<Pressable
			onPress={() => {
				handleNavigateThread(thread);
			}}
			style={styles.threadItemWrapper}
		>
			<View>
				<Text style={styles.threadName}>{thread?.channel_label}</Text>
				<View style={styles.threadContent}>
					<Text style={styles.textThreadCreateBy}>{username}</Text>
					<Text numberOfLines={1} ellipsizeMode="tail" style={styles.messageContent}>
						{lastSentMessage}
					</Text>
					<Text style={styles.bullet}>•</Text>
					<Text style={styles.createTime}>{timeMessage}</Text>
				</View>
			</View>
			<AngleRightIcon width={25} height={25} color={themeValue.textDisabled} />
		</Pressable>
	);
};

export default ThreadItem;
