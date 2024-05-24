import React from 'react';
import { View , Text , Image} from 'react-native';
import { NotifyProps } from '../types';
import { selectChannelById, selectMemberClanByUserId } from '@mezon/store-mobile';
import { useSelector } from 'react-redux';
import { styles as s } from './NotificationItem.styles';
import MessageNotification from '../MessageNotification';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useMessageSender } from '../../../hooks/useMessageSender';
import { useMessageParser } from '../../../hooks/useMessageParser';

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

const NotificationItem = React.memo(({ notify }: NotifyProps)=>{
  const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
  const { hasAvatar, avatarChar, avatarImg } = useMessageSender(user as any);
  const channelInfo = useSelector(selectChannelById(notify.content.channel_id));
  const data = parseObject(notify.content);
  const messageContent = JSON.parse(data.content);
  const { messageTimeDifference } = useMessageParser(data);
  const handleOnTouchMessage = ()=>{}

 return <TouchableOpacity onPress={handleOnTouchMessage}>
          <View style={s.notifyContainer}>
            <View style={s.notifyHeader}>
              {
                hasAvatar ? <View style={s.boxImage}><Image source={{uri: avatarImg,}} style={s.image}/></View> :
                <View style={s.boxImageChar}><Text>{avatarChar}</Text></View>
              }
              <View style={s.notifyContent}>
                <Text numberOfLines={2} style={s.notifyHeaderTitle}>{notify?.subject} - {channelInfo?.channel_label}:</Text>
                <View style={s.contentMessage}>
                    <MessageNotification message={data} newMessage={messageContent?.t}></MessageNotification>
                </View>
              </View>
              <Text style={s.notifyDuration}>{messageTimeDifference}</Text>
            </View>
          </View>
 </TouchableOpacity>
})

export default NotificationItem;
