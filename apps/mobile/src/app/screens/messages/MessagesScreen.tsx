import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useChatTypings, useMemberStatus } from '@mezon/core';
import { Icons, PaperclipIcon } from '@mezon/mobile-components';
import { Colors, ThemeModeBase, size, useTheme } from '@mezon/mobile-ui';
import { selectIsUnreadDMById, useAppSelector } from '@mezon/store';
import {
	DirectEntity,
	RootState,
	directActions,
	getStoreAsync,
	selectAllClans,
	selectDirectsOpenlist,
	selectTypingUserIdsByChannelId
} from '@mezon/store-mobile';
import { IExtendedMessage } from '@mezon/utils';
import LottieView from 'lottie-react-native';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, FlatList, Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import { TYPING_DARK_MODE, TYPING_LIGHT_MODE } from '../../../assets/lottie';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { MezonBottomSheet } from '../../temp-ui';
import { normalizeString } from '../../utils/helpers';
import UserEmptyMessage from '../home/homedrawer/UserEmptyClan/UserEmptyMessage';
import { RenderTextMarkdownContent } from '../home/homedrawer/components';
import MessageMenu from '../home/homedrawer/components/MessageMenu';
import { style } from './styles';

const SeparatorListFriend = () => {
	return <View style={{ height: size.s_8 }} />;
};

const DmListItem = React.memo((props: { directMessage: DirectEntity; navigation: any; onLongPress }) => {
	const { themeValue, theme } = useTheme();
	const styles = style(themeValue);
	const { directMessage, navigation, onLongPress } = props;
	const { typingUsers } = useChatTypings({ channelId: directMessage?.channel_id, mode: directMessage?.type, isPublic: false, isDM: true });
	const isUnReadChannel = useSelector(selectIsUnreadDMById(directMessage?.id));
	const { t } = useTranslation('message');
	const userStatus = useMemberStatus(directMessage?.user_id?.length === 1 ? directMessage?.user_id?.[0] : '');
	const redirectToMessageDetail = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
			screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
			params: { directMessageId: directMessage?.id }
		});
	};

	const otherMemberList = useMemo(() => {
		const userIdList = directMessage.user_id;
		const usernameList = (directMessage?.channel_label || directMessage?.usernames)?.split?.(',') || [];

		return usernameList?.map((username, index) => ({
			userId: userIdList?.[index],
			username: username
		}));
	}, [directMessage]);

	const getLastMessageContent = (content: string | IExtendedMessage) => {
		const text = typeof content === 'string' ? JSON.parse(content)?.t : JSON.parse(JSON.stringify(content))?.t;
		const lastMessageSender = otherMemberList.find((it) => it.userId === directMessage?.last_sent_message?.sender_id);

		if (!text) {
			return (
				<Text style={[styles.defaultText, styles.lastMessage, { color: isUnReadChannel ? themeValue.white : themeValue.text }]} numberOfLines={1}>
					{lastMessageSender ? lastMessageSender?.username : t('directMessage.you')}
					{': '}
					{'attachment '}
					<PaperclipIcon width={13} height={13} color={Colors.textGray} />
				</Text>
			);
		}

		return (
			<View style={styles.contentMessage}>
				<Text style={[styles.defaultText, styles.lastMessage, { color: isUnReadChannel ? themeValue.white : themeValue.text }]}>
					{lastMessageSender ? lastMessageSender?.username : t('directMessage.you')} {': '}
				</Text>
				{!!content && (
					<RenderTextMarkdownContent
						isOpenLink={false}
						isHiddenHashtag={true}
						content={typeof content === 'object' ? content : JSON.parse(content || '{}')}
						isUnReadChannel={isUnReadChannel}
					/>
				)}
			</View>
		);
	};

	const lastMessageTime = useMemo(() => {
		if (directMessage?.last_sent_message?.content) {
			const timestamp = Number(directMessage?.last_sent_message?.timestamp_seconds);
			return moment.unix(timestamp).format('DD/MM/YYYY HH:mm');
		}
		return null;
	}, [directMessage]);

	return (
		<TouchableOpacity style={styles.messageItem} onPress={() => redirectToMessageDetail()} onLongPress={onLongPress}>
			{directMessage?.channel_avatar?.length > 1 ? (
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

				{lastMessageTime ? getLastMessageContent(directMessage?.last_sent_message?.content) : null}
			</View>
		</TouchableOpacity>
	);
});

const MessagesScreen = ({ navigation }: { navigation: any }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [searchText, setSearchText] = useState<string>('');
	const dmGroupChatList = useSelector(selectDirectsOpenlist);
	const { t } = useTranslation(['dmMessage', 'common']);
	const clansLoadingStatus = useSelector((state: RootState) => state?.clans?.loadingStatus);
	const clans = useSelector(selectAllClans);
	const bottomSheetDMMessageRef = useRef<BottomSheetModal>(null);
	const searchInputRef = useRef(null);

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			appStateSubscription.remove();
		};
	}, []);

	const handleAppStateChange = async (state: string) => {
		if (state === 'active') {
			try {
				const store = await getStoreAsync();
				await store.dispatch(directActions.fetchDirectMessage({ noCache: true }));
			} catch (error) {
				console.log('error messageLoaderBackground', error);
			}
		}
	};

	const sortDM = (a, b) => {
		const timestampA = parseFloat(a.last_sent_message?.timestamp_seconds || '0');
		const timestampB = parseFloat(b.last_sent_message?.timestamp_seconds || '0');
		return timestampB - timestampA;
	};

	const filterDmGroupsByChannelLabel = (data: DirectEntity[]) => {
		const uniqueLabels = new Set();
		return data
			?.filter((obj: DirectEntity) => {
				const isUnique = !uniqueLabels.has(obj.channel_label || obj.usernames);
				uniqueLabels.add(obj.channel_label || obj.usernames);
				return isUnique;
			})
			.sort(sortDM);
	};

	const filteredDataDM = useMemo(() => {
		return filterDmGroupsByChannelLabel(dmGroupChatList)?.filter?.((dm) =>
			normalizeString(dm.channel_label || dm.usernames)?.includes(normalizeString(searchText))
		);
	}, [dmGroupChatList, searchText]);

	const navigateToAddFriendScreen = () => {
		navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.ADD_FRIEND });
	};

	const navigateToNewMessageScreen = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.NEW_MESSAGE });
	};

	const typingSearchDebounce = useThrottledCallback((text) => setSearchText(text), 500);

	const [directMessageSelected, setDirectMessageSelected] = useState<DirectEntity>(null);
	const handleLongPress = useCallback((directMessage: DirectEntity) => {
		bottomSheetDMMessageRef.current?.present();
		setDirectMessageSelected(directMessage);
	}, []);

	const clearTextInput = () => {
		if (searchInputRef?.current) {
			searchInputRef.current.clear();
			setSearchText('');
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerWrapper}>
				<Text style={styles.headerTitle}>{t('dmMessage:title')}</Text>
				<Pressable style={styles.addFriendWrapper} onPress={() => navigateToAddFriendScreen()}>
					<Icons.UserPlusIcon height={size.s_20} width={size.s_20} color={themeValue.textStrong} />
					<Text style={styles.addFriendText}>{t('dmMessage:addFriend')}</Text>
				</Pressable>
			</View>

			<View style={styles.searchMessage}>
				<Icons.MagnifyingIcon height={size.s_20} width={size.s_20} color={themeValue.text} />
				<TextInput
					ref={searchInputRef}
					placeholder={t('common:searchPlaceHolder')}
					placeholderTextColor={themeValue.text}
					style={styles.searchInput}
					onChangeText={(text) => typingSearchDebounce(text)}
				/>
				{!!searchText?.length && (
					<Pressable onPress={clearTextInput}>
						<Icons.CircleXIcon height={size.s_20} width={size.s_20} color={themeValue.text} />
					</Pressable>
				)}
			</View>
			{clansLoadingStatus === 'loaded' && !clans?.length && !filteredDataDM?.length ? (
				<UserEmptyMessage
					onPress={() => {
						navigateToAddFriendScreen();
					}}
				/>
			) : (
				<FlatList
					data={filteredDataDM}
					style={styles.dmMessageListContainer}
					showsVerticalScrollIndicator={false}
					keyExtractor={(dm) => dm.id.toString()}
					ItemSeparatorComponent={SeparatorListFriend}
					renderItem={({ item }) => (
						<DmListItem directMessage={item} navigation={navigation} key={item.id} onLongPress={() => handleLongPress(item)} />
					)}
				/>
			)}

			<Pressable style={styles.addMessage} onPress={() => navigateToNewMessageScreen()}>
				<Icons.MessagePlusIcon width={size.s_22} height={size.s_22} />
			</Pressable>

			<MezonBottomSheet ref={bottomSheetDMMessageRef} snapPoints={['40%', '60%']}>
				<MessageMenu messageInfo={directMessageSelected} />
			</MezonBottomSheet>
		</View>
	);
};

export default MessagesScreen;
