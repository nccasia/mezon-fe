import { AVATAR_DEFAULT_URL } from '@mezon/mobile-components';
import { selectMemberClanByUserId } from '@mezon/store-mobile';
import { getTimeDifferenceDate } from '@mezon/utils';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useMessageSender } from '../../../hooks/useMessageSender';
import { ENotifyBsToShow, NotifyProps } from '../types';
import { styles as s } from './NotificationIndividualItem.styles';

function NotificationIndividualItem({ notify, onLongPressNotify, onPressNotify }: NotifyProps) {
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
	const { avatarImg } = useMessageSender(user as any);
	const userName = notify?.content?.username || user?.user?.display_name || user?.user?.username;
	const messageTimeDifference = getTimeDifferenceDate(notify.create_time);

	let notice = notify?.subject;

	if (userName) {
		const userNameLength = userName?.length;
		notice = notify?.subject?.includes(userName) ? notify?.subject?.slice(userNameLength) : notify?.subject;
	}

	return (
		<TouchableOpacity
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
