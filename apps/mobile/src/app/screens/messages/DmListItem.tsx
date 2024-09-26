import { useChatTypings } from '@mezon/core';
import { Icons, PaperclipIcon } from '@mezon/mobile-components';
import { Colors, ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { selectIsUnreadDMById } from '@mezon/store';
import { DirectEntity } from '@mezon/store-mobile';
import { IExtendedMessage } from '@mezon/utils';
import LottieView from 'lottie-react-native';
import { ChannelType } from 'mezon-js';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { TYPING_DARK_MODE, TYPING_LIGHT_MODE } from '../../../assets/lottie';
import useTabletLandscape from '../../hooks/useTabletLandscape';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { RenderTextMarkdownContent } from '../home/homedrawer/components';
import { style } from './styles';

export const DmListItem = React.memo((props: { directMessage: DirectEntity; navigation: any; onLongPress; onPress?; directMessageId? }) => {
	const { themeValue, theme } = useTheme();
	const styles = style(themeValue);
	const { directMessage, navigation, onLongPress, onPress, directMessageId } = props;
	const { typingUsers } = useChatTypings({ channelId: directMessage?.channel_id, mode: directMessage?.type, isPublic: false, isDM: true });
	const isUnReadChannel = useSelector(selectIsUnreadDMById(directMessage?.id));
	const { t } = useTranslation('message');
	const userStatus = directMessage?.is_online?.some(Boolean);
	const isTabletLandscape = useTabletLandscape();

	const redirectToMessageDetail = () => {
		if (isTabletLandscape) {
			onPress && onPress(directMessage?.id)
		} else {
			navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
				screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
				params: { directMessageId: directMessage?.id }
			});
		}
	};

	const isTypeDMGroup = useMemo(() => {
		return Number(directMessage?.type) === ChannelType.CHANNEL_TYPE_GROUP;
	}, [directMessage?.type]);

	const otherMemberList = useMemo(() => {
		const userIdList = directMessage.user_id;
		const usernameList = directMessage?.channel_label?.split?.(',') || [];

		return usernameList?.map((username, index) => ({
			userId: userIdList?.[index],
			username: username
		}));
	}, [directMessage]);

	const getLastMessageContent = (content: string | IExtendedMessage) => {
		if (!content) return null;
		const text = typeof content === 'string' ? JSON.parse(content)?.t : JSON.parse(JSON.stringify(content))?.t;
		const lastMessageSender = otherMemberList.find((it) => it.userId === directMessage?.last_sent_message?.sender_id);
		const isUnread = Boolean(lastMessageSender) && isUnReadChannel;

		if (!text) {
			return (
				<Text style={[styles.defaultText, styles.lastMessage, { color: isUnread ? themeValue.white : themeValue.text }]} numberOfLines={1}>
					{lastMessageSender ? lastMessageSender?.username : t('directMessage.you')}
					{': '}
					{'attachment '}
					<PaperclipIcon width={13} height={13} color={Colors.textGray} />
				</Text>
			);
		}

		return (
			<View style={styles.contentMessage}>
				<Text style={[styles.defaultText, styles.lastMessage, { color: isUnread ? themeValue.white : themeValue.text }]}>
					{lastMessageSender ? lastMessageSender?.username : t('directMessage.you')} {': '}
				</Text>
				{!!content && (
					<RenderTextMarkdownContent
						isOpenLink={false}
						isHiddenHashtag={true}
						content={typeof content === 'object' ? content : JSON.parse(content || '{}')}
						isUnReadChannel={isUnread}
					/>
				)}
			</View>
		);
	};

	const lastMessageTime = useMemo(() => {
		if (directMessage?.last_sent_message?.timestamp_seconds) {
			const timestamp = Number(directMessage?.last_sent_message?.timestamp_seconds);
			return moment.unix(timestamp).format('DD/MM/YYYY HH:mm');
		}
		return null;
	}, [directMessage]);

	return (
		<TouchableOpacity 
			style={[styles.messageItem, 
					isTabletLandscape && directMessageId === directMessage?.id && { backgroundColor: themeValue.secondary }
				]} 
			onPress={() => redirectToMessageDetail()} 
			onLongPress={onLongPress}
		>
			{isTypeDMGroup ? (
				<View style={styles.groupAvatar}>
					<Icons.GroupIcon />
				</View>
			) : (
				<View style={styles.avatarWrapper}>
					{directMessage?.channel_avatar?.[0] ? (
						<Image source={{ uri: directMessage?.channel_avatar?.[0] }} style={styles.friendAvatar} />
					) : (
						<View style={styles.wrapperTextAvatar}>
							<Text style={styles.textAvatar}>{(directMessage?.channel_label || directMessage?.usernames)?.charAt?.(0)}</Text>
						</View>
					)}
					{typingUsers?.length > 0 ? (
						<View style={[styles.statusTyping, userStatus ? styles.online : styles.offline]}>
							<LottieView
								source={theme === ThemeModeBase.DARK ? TYPING_DARK_MODE : TYPING_LIGHT_MODE}
								autoPlay
								loop
								style={styles.lottie}
							/>
						</View>
					) : (
						<View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
					)}
				</View>
			)}

			<View style={{ flex: 1 }}>
				<View style={styles.messageContent}>
					<Text numberOfLines={1} style={[styles.defaultText, styles.channelLabel]}>
						{directMessage?.channel_label || directMessage?.usernames}
					</Text>
					{lastMessageTime ? <Text style={[styles.defaultText, styles.dateTime]}>{lastMessageTime}</Text> : null}
				</View>

				{getLastMessageContent(directMessage?.last_sent_message?.content)}
			</View>
		</TouchableOpacity>
	);
});
