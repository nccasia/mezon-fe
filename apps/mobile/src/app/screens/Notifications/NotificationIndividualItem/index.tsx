import { selectMemberClanByUserId } from '@mezon/store';
import { getTimeDifferenceDate } from '@mezon/utils';
import { INotification } from 'libs/store/src/lib/notification/notify.slice';
import { useSelector } from 'react-redux';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import { styles as s } from './NotificationIndividualItem.styles';
import { useMessageSender } from '../../../hooks/useMessageSender';
export type NotifyProps = {
	readonly notify: INotification;
};

function NotificationIndividualItem({ notify }: NotifyProps) {
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
  const { hasAvatar, avatarChar, avatarImg } = useMessageSender(user as any);
	const userName = notify?.content?.username;
  const  messageTimeDifference  = getTimeDifferenceDate(notify.create_time);

	let notice = notify?.subject;

	if (userName) {
		const userNameLenght = userName.length;
		notice = notify?.subject?.slice(userNameLenght);
	}
  const handleOnTouchMessage =()=>{};

	return (
    <TouchableOpacity onPress={handleOnTouchMessage}>
    <View style={s.notifyContainer}>
      <View style={s.notifyHeader}>
        {
          hasAvatar ? <View style={s.boxImage}><Image source={{uri: avatarImg,}} style={s.image}/></View> :
          <View style={s.boxImageChar}><Text>{avatarChar}</Text></View>
        }
        <View style={s.notifyContent}>
          <Text numberOfLines={2} style={s.notifyHeaderTitle}>{userName} {notice}</Text>
        </View>
        <Text style={s.notifyDuration}>{messageTimeDifference}</Text>
      </View>
    </View>
</TouchableOpacity>
	);
}

export default NotificationIndividualItem;
