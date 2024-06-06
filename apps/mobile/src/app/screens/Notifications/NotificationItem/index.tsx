import { selectChannelById, selectMemberClanByUserId } from '@mezon/store-mobile';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { useMessageSender } from '../../../hooks/useMessageSender';
import MessageNotification from '../MessageNotification';
import { NotifyProps } from '../types';
import { styles as s } from './NotificationItem.styles';
import {AVATAR_DEFAULT_URL} from "@mezon/mobile-components";

function parseObject(obj: any) {
	let attachments;
	let mentions;
	let reactions;
	let references;
	try {
		attachments = JSON.parse(obj.attachments);
	} catch (err) {
		attachments = {};
	}
	try {
		mentions = JSON.parse(obj.mentions);
	} catch (err) {
		mentions = {};
	}
	try {
		references = JSON.parse(obj.references);
	} catch (err) {
		references = {};
	}
	try {
		reactions = JSON.parse(obj.reactions);
	} catch (err) {
		reactions = {};
	}
	const parsedObj = {
		...obj,
		attachments,
		mentions,
		reactions,
		references,
	};
	return parsedObj;
}

const NotificationItem = React.memo(({ notify }: NotifyProps) => {
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
	const { hasAvatar, avatarChar, avatarImg } = useMessageSender(user as any);
	const channelInfo = useSelector(selectChannelById(notify.content.channel_id));
	const data = parseObject(notify.content);
	const messageContent = JSON.parse(data.content);
	const { messageTimeDifference } = useMessageParser(data);
	const handleOnTouchMessage = () => {};
	return (
		<TouchableOpacity onPress={handleOnTouchMessage}>
			<View style={s.notifyContainer}>
				<View style={s.notifyHeader}>
					<View style={s.boxImage}>
						<Image source={{ uri: avatarImg || AVATAR_DEFAULT_URL }} style={s.image} />
					</View>
					<View style={s.notifyContent}>
						<Text numberOfLines={2} style={s.notifyHeaderTitle}>
							{notify?.subject} - {channelInfo?.channel_label}:
						</Text>
						<View style={s.contentMessage}>
							<MessageNotification message={data} newMessage={messageContent?.t}></MessageNotification>
						</View>
					</View>
					<Text style={s.notifyDuration}>{messageTimeDifference}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
});

export default NotificationItem;
