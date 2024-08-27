import { useAuth } from '@mezon/core';
import { UserGroupIcon } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { DirectEntity, selectDirectsUnreadlist } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { APP_SCREEN } from 'apps/mobile/src/app/navigation/ScreenTypes';
import { ChannelType } from 'mezon-js';
import React, { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { style } from './styles';

const UnreadDMBadgeItem = memo(({ dm }: { dm: DirectEntity }) => {
	const navigation = useNavigation<any>();
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const getBadge = (dm: DirectEntity) => {
		switch (dm.type) {
			case ChannelType.CHANNEL_TYPE_DM:
				return (
					<View style={styles.avatarWrapper}>
						{dm?.channel_avatar?.[0] ? (
							<Image source={{ uri: dm?.channel_avatar?.[0] }} resizeMode="cover" style={styles.groupAvatar} />
						) : (
							<View style={styles.wrapperTextAvatar}>
								<Text style={styles.textAvatar}>{dm?.channel_label?.charAt?.(0)}</Text>
							</View>
						)}
						<View style={styles.badge}>
							<Text style={styles.badgeText}>{dm?.count_mess_unread}</Text>
						</View>
					</View>
				);
			case ChannelType.CHANNEL_TYPE_GROUP:
				return (
					<View style={styles.groupAvatar}>
						<UserGroupIcon />
						<View style={styles.badge}>
							<Text style={styles.badgeText}>{dm?.count_mess_unread}</Text>
						</View>
					</View>
				);
			default:
				return <View />;
		}
	};

	const navigateToDirectMessageMDetail = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
			screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
			params: { directMessageId: dm?.channel_id, from: APP_SCREEN.HOME },
		});
	};

	return (
		<TouchableOpacity onPress={navigateToDirectMessageMDetail} style={[styles.mt10]}>
			<View>{getBadge(dm)}</View>
		</TouchableOpacity>
	);
});

export const UnreadDMBadgeList = React.memo(() => {
	const { userId } = useAuth();
	const unReadDirectMessageList = useSelector(selectDirectsUnreadlist);
	const unReadDM = unReadDirectMessageList.filter((dm) => dm?.last_sent_message?.sender_id !== userId);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View style={styles.container}>
			{!!unReadDM?.length &&
				unReadDM?.map((dm: DirectEntity, index) => {
					return <UnreadDMBadgeItem key={`${dm?.id}_${index}`} dm={dm} />;
				})}
		</View>
	);
});
