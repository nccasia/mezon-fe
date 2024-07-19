import { useMemberStatus } from '@mezon/core';
import { Icons, PaperclipIcon } from '@mezon/mobile-components';
import { Colors, size, useTheme } from '@mezon/mobile-ui';
import { DirectEntity, RootState, selectAllClans, selectAllEmojiSuggestion, selectDirectsOpenlist } from '@mezon/store-mobile';
import { getSrcEmoji } from '@mezon/utils';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { emojiRegex, normalizeString } from '../../utils/helpers';
import { removeBlockCode } from '../home/homedrawer/constants';
import UserEmptyMessage from '../home/homedrawer/UserEmptyClan/UserEmptyMessage';
import { style } from './styles';

const SeparatorListFriend = () => {
	return <View style={{ height: size.s_8 }} />;
};

const DmListItem = React.memo((props: { directMessage: DirectEntity; navigation: any }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { directMessage, navigation } = props;
	const { t } = useTranslation('message');
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const userStatus = useMemberStatus(directMessage?.user_id?.length === 1 ? directMessage?.user_id[0] : '');
	const redirectToMessageDetail = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
			screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
			params: { directMessageId: directMessage?.id },
		});
	};

	const otherMemberList = useMemo(() => {
		const userIdList = directMessage.user_id;
		const usernameList = directMessage?.channel_label?.split?.(',');

		return usernameList.map((username, index) => ({
			userId: userIdList[index],
			username: username,
		}));
	}, [directMessage]);

	const getLastMessageContent = (content) => {
		const text = typeof content === 'string' ? JSON.parse(content)?.t : JSON.parse(JSON.stringify(content))?.t;
		const lastMessageSender = otherMemberList.find((it) => it.userId === directMessage?.last_sent_message?.sender_id);

		if (!text) {
			return (
				<Text style={[styles.defaultText, styles.lastMessage]} numberOfLines={1}>
					{lastMessageSender ? lastMessageSender?.username : t('directMessage.you')}
					{': '}
					{'attachment '}
					<PaperclipIcon width={13} height={13} color={Colors.textGray} />
				</Text>
			);
		}

		const parts = removeBlockCode?.(text?.trim())?.split(/(:[^:]+:)/);
		return (
			<View style={{ flex: 1, maxHeight: size.s_18, flexDirection: 'row', flexWrap: 'nowrap', overflow: 'hidden' }}>
				<Text style={[styles.defaultText, styles.lastMessage]}>
					{lastMessageSender ? lastMessageSender?.username : t('directMessage.you')} {': '}
				</Text>
				{parts?.map?.((part, index) => {
					if (!part) return null;
					if (part.match(emojiRegex)) {
						const srcEmoji = getSrcEmoji(part, emojiListPNG);
						return <FastImage key={index} source={{ uri: srcEmoji }} style={{ width: 18, height: 18 }} />;
					}
					return (
						<Text style={[styles.defaultText, styles.lastMessage]} key={index}>
							{part}{' '}
						</Text>
					);
				})}
			</View>
		);
	};

	const lastMessageTime = useMemo(() => {
		if (directMessage?.last_sent_message?.content) {
			const timestamp = Number(directMessage?.last_sent_message?.timestamp);
			return moment.unix(timestamp).format('DD/MM/YYYY HH:mm');
		}
		return null;
	}, [directMessage]);

	return (
		<TouchableOpacity style={styles.messageItem} onPress={() => redirectToMessageDetail()}>
			{directMessage?.channel_avatar?.length > 1 ? (
				<View style={styles.groupAvatar}>
					<Icons.GroupIcon />
				</View>
			) : (
				<View>
					<Image source={{ uri: directMessage?.channel_avatar?.[0] }} style={styles.friendAvatar} />
					<View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
				</View>
			)}

			<View style={{ flex: 1 }}>
				<View style={styles.messageContent}>
					<Text numberOfLines={1} style={[styles.defaultText, styles.channelLabel]}>
						{directMessage?.channel_label}
					</Text>
					{lastMessageTime ? <Text style={[styles.defaultText, styles.dateTime]}>{lastMessageTime}</Text> : null}
				</View>

				{lastMessageTime ? getLastMessageContent(directMessage?.last_sent_message?.content) : null}
			</View>
		</TouchableOpacity>
	);
});

const MessagesScreen = ({ navigation }: { navigation: any }) => {
	const { themeValue, themeBasic } = useTheme();
	const styles = style(themeValue);
	const [searchText, setSearchText] = useState<string>('');
	const dmGroupChatList = useSelector(selectDirectsOpenlist);
	const { t } = useTranslation(['dmMessage', 'common']);
	const clansLoadingStatus = useSelector((state: RootState) => state?.clans?.loadingStatus);
	const clans = useSelector(selectAllClans);

	const sortDM = (a, b) => {
		const timestampA = parseFloat(a.last_sent_message?.timestamp || '0');
		const timestampB = parseFloat(b.last_sent_message?.timestamp || '0');
		return timestampB - timestampA;
	};

	const filterDmGroupsByChannelLabel = (data: DirectEntity[]) => {
		const uniqueLabels = new Set();
		return data
			?.filter((obj: DirectEntity) => {
				const isUnique = !uniqueLabels.has(obj.channel_label);
				uniqueLabels.add(obj.channel_label);
				return isUnique;
			})
			.sort(sortDM);
	};

	const filteredDataDM = useMemo(() => {
		return filterDmGroupsByChannelLabel(dmGroupChatList)?.filter?.((dm) =>
			normalizeString(dm.channel_label)?.includes(normalizeString(searchText)),
		);
	}, [dmGroupChatList, searchText]);

	const navigateToAddFriendScreen = () => {
		navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.ADD_FRIEND });
	};

	const navigateToNewMessageScreen = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.NEW_MESSAGE });
	};

	const typingSearchDebounce = useThrottledCallback((text) => setSearchText(text), 500);

	return (
		<View style={styles.container}>
			<View style={styles.headerWrapper}>
				<Text style={styles.headerTitle}>{t('dmMessage:title')}</Text>
				<Pressable style={styles.addFriendWrapper} onPress={() => navigateToAddFriendScreen()}>
					<Icons.UserPlusIcon height={20} width={20} color={themeValue.textStrong} />
					<Text style={styles.addFriendText}>{t('dmMessage:addFriend')}</Text>
				</Pressable>
			</View>

			<View style={styles.searchMessage}>
				<Icons.MagnifyingIcon height={20} width={20} color={themeValue.text} />
				<TextInput
					placeholder={t('common:searchPlaceHolder')}
					placeholderTextColor={themeValue.text}
					style={styles.searchInput}
					onChangeText={(text) => typingSearchDebounce(text)}
					keyboardAppearance={themeBasic === "dark" ? "dark" : "light"}
				/>
			</View>
			{
				clansLoadingStatus === 'loaded' && !clans?.length && !filteredDataDM?.length ?
					<UserEmptyMessage onPress={() => { navigateToAddFriendScreen() }} /> :
					(
						<FlatList
							data={filteredDataDM}
							style={styles.dmMessageListContainer}
							showsVerticalScrollIndicator={false}
							keyExtractor={(dm) => dm.id.toString()}
							ItemSeparatorComponent={SeparatorListFriend}
							renderItem={({ item }) => <DmListItem directMessage={item} navigation={navigation} key={item.id} />}
						/>
					)
			}

			<Pressable style={styles.addMessage} onPress={() => navigateToNewMessageScreen()}>
				<Icons.MessagePlusIcon width={22} height={22} />
			</Pressable>
		</View>
	);
};

export default MessagesScreen;
