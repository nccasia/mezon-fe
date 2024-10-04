import { AVATAR_DEFAULT_URL } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { selectMemberClanByUserId } from '@mezon/store-mobile';
import { getTimeDifferenceDate } from '@mezon/utils';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useMessageSender } from '../../../hooks/useMessageSender';
import { ENotifyBsToShow, NotifyProps } from '../types';
import { style } from './NotificationIndividualItem.styles';

function NotificationIndividualItem({ notify, onLongPressNotify, onPressNotify }: NotifyProps) {
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
	const { avatarImg } = useMessageSender(user as any);
	const userName = notify?.content?.username || user?.user?.display_name || user?.user?.username;
	const messageTimeDifference = getTimeDifferenceDate(notify.create_time);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	let notice = notify?.subject;

	if (userName) {
		const userNameLength = userName?.length;
		notice = notify?.subject?.includes(userName) ? notify?.subject?.slice(userNameLength) : notify?.subject;
	}

	return (
		<TouchableOpacity
			onPress={() => {
				onPressNotify(notify);
			}}
			onLongPress={() => {
				onLongPressNotify(ENotifyBsToShow.removeNotification, notify);
			}}
		>
			<View style={styles.notifyContainer}>
				<View style={styles.notifyHeader}>
					<View style={styles.boxImage}>
						<Image source={{ uri: avatarImg || AVATAR_DEFAULT_URL }} style={styles.image} />
					</View>
					<View style={styles.notifyContent}>
						<Text numberOfLines={2} style={styles.notifyHeaderTitle}>
							{userName} {notice}
						</Text>
					</View>
					<Text style={styles.notifyDuration}>{messageTimeDifference}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

export default NotificationIndividualItem;
