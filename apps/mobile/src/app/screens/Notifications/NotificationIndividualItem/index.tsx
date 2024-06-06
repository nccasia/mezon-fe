import { AVATAR_DEFAULT_URL } from '@mezon/mobile-components';
import {selectAllUsesClan, selectMemberClanByUserId} from '@mezon/store-mobile';
import { getTimeDifferenceDate } from '@mezon/utils';
import { INotification } from 'libs/store/src/lib/notification/notify.slice';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useMessageSender } from '../../../hooks/useMessageSender';
import { styles as s } from './NotificationIndividualItem.styles';
export type NotifyProps = {
	readonly notify: INotification;
};

function NotificationIndividualItem({ notify }: NotifyProps) {
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
	const { hasAvatar, avatarChar, avatarImg } = useMessageSender(user as any);
	const userName = notify?.content?.username;
	const messageTimeDifference = getTimeDifferenceDate(notify.create_time);

	let notice = notify?.subject;

	if (userName) {
		const userNameLenght = userName.length;
		notice = notify?.subject?.slice(userNameLenght);
	}
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
							{userName} {notice}
						</Text>
					</View>
					<Text style={s.notifyDuration}>{messageTimeDifference}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

export default NotificationIndividualItem;
