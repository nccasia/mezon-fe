import { ActionEmitEvent, AngleRightIcon } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { ChannelsEntity, MessagesEntity, channelsActions, getStoreAsync, selectLastMessageIdByChannelId, selectMemberClanByUserId, selectMessageEntityById, useAppSelector } from '@mezon/store-mobile';
import { IChannel, IChannelMember, convertTimeMessage } from '@mezon/utils';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { DeviceEventEmitter, Pressable, Text, View } from 'react-native';
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
	const messageId = useAppSelector((state) => selectLastMessageIdByChannelId(state, thread?.channel_id as string));
	const message = useAppSelector((state) =>
		selectMessageEntityById(state, thread?.channel_id as string, messageId || thread?.last_sent_message?.id) as MessagesEntity
	);
	const user = useSelector(selectMemberClanByUserId((message?.user?.id || thread?.last_sent_message?.sender_id) as string)) as IChannelMember;

	const { username } = useMessageSender(user);
	const handleNavigateThread = async (thread?: IChannel) => {
		const store = await getStoreAsync();
		navigation.navigate(APP_SCREEN.HOME as never);
		navigation.dispatch(DrawerActions.closeDrawer());
		const channelId = thread?.channel_id;
		const clanId = thread?.clan_id;
		store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
		DeviceEventEmitter.emit(ActionEmitEvent.SCROLL_TO_ACTIVE_CHANNEL, { channelId: channelId, categoryId: thread?.category_id });
	};
	
	const timeMessage = useMemo(() => {
		if (message && message.create_time_seconds) {
			const lastTime = convertTimeMessage(message.create_time_seconds);
			return lastTime;
		} else {
			if (thread && thread.last_sent_message && thread.last_sent_message.timestamp_seconds) {
				const lastTime = convertTimeMessage(thread.last_sent_message.timestamp_seconds);
				return lastTime;
			}
		}
	}, [message, thread]);

	const checkType = useMemo(() => typeof thread.last_sent_message?.content === 'string', [thread.last_sent_message?.content]);
	const lastSentMessage = useMemo(() => {
		return (message?.content?.t as string) ??
			(thread.last_sent_message && checkType
				? JSON.parse(thread.last_sent_message.content || '{}').t
				: (thread.last_sent_message?.content as any)?.t || '')
	}, [message, thread])

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
