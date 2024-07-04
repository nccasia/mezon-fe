import { AVATAR_DEFAULT_URL } from '@mezon/mobile-components';
import { selectChannelById, selectMemberClanByUserId } from '@mezon/store-mobile';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { useMessageSender } from '../../../hooks/useMessageSender';
import { ENotifyBsToShow, NotifyProps } from '../types';
import { styles as s } from './NotificationItem.styles';
import MessageItem from '../../home/homedrawer/components/HomeDeafult/MessageItem';
import { ChannelStreamMode } from 'mezon-js';

function parseObject(obj: any) {
	let attachments;
	let mentions;
	let reactions;
	let references;
  let content;
	try {
		attachments = obj?.attachments && JSON.parse(obj?.attachments);
	} catch (err) {
		attachments = {};
	}
	try {
		mentions =  obj?.mentions &&  JSON.parse(obj?.mentions);
	} catch (err) {
		mentions = {};
	}
	try {
		references = obj?.references && JSON.parse(obj?.references);
	} catch (err) {
		references = {};
	}
	try {
		reactions = obj?.reactions && JSON.parse(obj?.reactions);
	} catch (err) {
		reactions = {};
	}

  try {
    content = obj?.content && JSON.parse(obj?.content);
	} catch (err) {
		content = {};
	}
	const parsedObj = {
		...obj,
		attachments,
		mentions,
		reactions,
		references,
    content
	};
	return parsedObj;
}

const NotificationItem = React.memo(({ notify, onLongPressNotify, onPressNotify }: NotifyProps) => {
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
	const { hasAvatar, avatarChar, avatarImg } = useMessageSender(user as any);
	const channelInfo = useSelector(selectChannelById(notify.content.channel_id));
	const data = parseObject(notify?.content);
	const { messageTimeDifference } = useMessageParser(data);
	return (
		<TouchableOpacity
			onPress={() => {
				onPressNotify(notify);
			}}
			onLongPress={() => {
				onLongPressNotify(ENotifyBsToShow.removeNotification, notify);
			}}
		>
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
            				<MessageItem
								message={data}
								mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
								channelId={data?.channel_id}
								preventAction
							/>
						</View>
					</View>
					<Text style={s.notifyDuration}>{messageTimeDifference}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
});

export default NotificationItem;
