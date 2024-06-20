import moment from 'moment';
import React, { useState, useMemo, useCallback } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { MessageIcon, UserGroupIcon, UserPlusIcon } from '@mezon/mobile-components';
import { Colors, size } from '@mezon/mobile-ui';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { useAuth, useMemberStatus } from '@mezon/core';
import { emojiRegex, normalizeString } from '../../utils/helpers';
import { useThrottledCallback } from 'use-debounce';
import { useSelector } from 'react-redux';
import { DirectEntity, selectDirectsOpenlist, selectEmojiImage, selectMemberByUserId } from '@mezon/store-mobile';
import { removeBlockCode } from '../home/homedrawer/constants';
import FastImage from 'react-native-fast-image';
import { getSrcEmoji } from '@mezon/utils';

const SeparatorListFriend = () => {
	return (
		<View style={{ height: size.s_8 }} />
	)
}

const DmListItem = React.memo((props: { directMessage: DirectEntity, navigation: any}) => {
	const { directMessage, navigation } = props;
	const { t } = useTranslation('message');
	const { userId } = useAuth();
	const emojiListPNG = useSelector(selectEmojiImage);
	const userStatus = useMemberStatus(directMessage?.user_id?.length === 1 ? directMessage?.user_id[0] : '');
	const senderMessage = useSelector(selectMemberByUserId(directMessage?.last_sent_message?.sender_id || ''));
	const redirectToMessageDetail = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL, params: { directMessageId: directMessage?.id } })
	}

	const formatLastMessageContent = useCallback((text: string) => {
		const parts = removeBlockCode?.(text)?.split(/(:[^:]+:)/);
		const content = parts?.map?.((part, index) => {
			if (part.match(emojiRegex)) {
				const srcEmoji = getSrcEmoji(part, emojiListPNG);
				return <FastImage key={index} source={{uri: srcEmoji}} style={{width: 18, height: 18}} />
			}
			return <Text key={index}>{part} </Text>
		})
		return (
			<Text style={[styles.defaultText, styles.lastMessage]} numberOfLines={1}>
				{directMessage?.last_sent_message?.sender_id === userId ? t('directMessage.you') : senderMessage?.user?.username}
				{': '}
				{content}
			</Text>
		)
	}, [directMessage, emojiListPNG, t, userId, senderMessage])

	const lastMessage = useMemo(() => {
		if (directMessage?.last_sent_message?.content) {
			const timestamp = Number(directMessage?.last_sent_message?.timestamp);
			const content = directMessage?.last_sent_message?.content;
			const text = typeof content === 'string' ? JSON.parse(content)?.t : JSON.parse(JSON.stringify(content))?.t;
			return {
				time: moment.unix(timestamp).format('DD/MM/YYYY HH:mm'),
				textContent: formatLastMessageContent(text?.trim())
			}
		}
		return null;
	}, [directMessage, formatLastMessageContent])

	return (
		<TouchableOpacity style={styles.messageItem} onPress={() => redirectToMessageDetail()}>
			{directMessage?.channel_avatar?.length > 1 ? (
				<View style={styles.groupAvatar}>
					<UserGroupIcon />
				</View>
			) : (
				<View>
					<Image source={{ uri: directMessage.channel_avatar[0] }} style={styles.friendAvatar} />
					<View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
				</View>
			)}

			<View style={{ flex: 1 }}>
				<View style={styles.messageContent}>
					<Text
						numberOfLines={1}
						style={[styles.defaultText, styles.channelLabel]}
					>
						{directMessage.channel_label}
					</Text>
					{lastMessage ? (
						<Text style={[styles.defaultText, styles.dateTime]}>{lastMessage.time}</Text>
					): null}
				</View>

				{lastMessage ? (
					lastMessage.textContent
				): null}
			</View>
		</TouchableOpacity>
	)
})

const MessagesScreen = ({ navigation }: { navigation: any }) => {
	const [searchText, setSearchText] = useState<string>('');
	const dmGroupChatList = useSelector(selectDirectsOpenlist);
	const { t } = useTranslation(['dmMessage', 'common']);

	const sortDM = (a, b) => {
		const timestampA = parseFloat(a.last_sent_message?.timestamp || '0');
		const timestampB = parseFloat(b.last_sent_message?.timestamp || '0');
		return timestampB - timestampA;
	};

	const filterDmGroupsByChannelLabel = (data: DirectEntity[]) => {
		const uniqueLabels = new Set();
		return data?.filter((obj: DirectEntity) => {
			const isUnique = !uniqueLabels.has(obj.channel_label);
			uniqueLabels.add(obj.channel_label);
			return isUnique;
		}).sort(sortDM);
	};

	const filteredDataDM = useMemo(() => {
		return filterDmGroupsByChannelLabel(dmGroupChatList).filter(dm => normalizeString(dm.channel_label).includes(normalizeString(searchText)));
	}, [dmGroupChatList, searchText]);

	const navigateToAddFriendScreen = () => {
		navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.ADD_FRIEND });
	}

	const navigateToNewMessageScreen = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.NEW_MESSAGE });
	}

	const typingSearchDebounce = useThrottledCallback((text) => setSearchText(text), 500)

	return (
		<View style={styles.container}>
			<View style={styles.headerWrapper}>
				<Text style={styles.headerTitle}>{t('dmMessage:title')}</Text>
				<Pressable style={styles.addFriendWrapper} onPress={() => navigateToAddFriendScreen()}>
					<UserPlusIcon height={15} width={30} />
					<Text style={styles.addFriendText}>{t('dmMessage:addFriend')}</Text>
				</Pressable>
			</View>

			<View style={styles.searchMessage}>
				<Feather size={18} name="search" style={{ color: Colors.tertiary }} />
				<TextInput
					placeholder={t('common:searchPlaceHolder')}
					placeholderTextColor={Colors.tertiary}
					style={styles.searchInput}
					onChangeText={(text) => typingSearchDebounce(text)}
				/>
			</View>

			<FlatList
				data={filteredDataDM}
				style={styles.dmMessageListContainer}
				keyExtractor={(dm) => dm.id.toString()}
				ItemSeparatorComponent={SeparatorListFriend}
				renderItem={({ item }) => <DmListItem directMessage={item} navigation={navigation} key={item.id} />}
			/>

			<Pressable style={styles.addMessage} onPress={() => navigateToNewMessageScreen()}>
				<MessageIcon width={32} height={25} style={{marginLeft: -5}} />
			</Pressable>
		</View>
	);
};

export default MessagesScreen;
