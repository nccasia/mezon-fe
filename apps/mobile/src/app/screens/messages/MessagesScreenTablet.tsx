import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import {
	DirectEntity,
	RootState,
	appActions,
	directActions,
	getStoreAsync,
	selectAllClans,
	selectDirectsOpenlist,
	selectDmGroupCurrentId,
	useAppDispatch
} from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import { SeparatorWithSpace } from '../../components/Common';
import useTabletLandscape from '../../hooks/useTabletLandscape';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { MezonBottomSheet } from '../../temp-ui';
import { normalizeString } from '../../utils/helpers';
import { FriendsTablet } from '../friend/FriendsTablet';
import ServerList from '../home/homedrawer/ServerList';
import UserEmptyMessage from '../home/homedrawer/UserEmptyClan/UserEmptyMessage';
import MessageMenu from '../home/homedrawer/components/MessageMenu';
import { DirectMessageDetailTablet } from './DirectMessageDetailTablet';
import { DmListItem } from './DmListItem';
import { style } from './styles';

const sortDMItem = (notSortedArr: IChannel[]): IChannel[] => {
	return notSortedArr.sort((a, b) => {
		const timestampA = a.last_sent_message?.timestamp_seconds || a.create_time_seconds || 0;
		const timestampB = b.last_sent_message?.timestamp_seconds || b.create_time_seconds || 0;
		return timestampB - timestampA;
	});
};

const MessagesScreenTablet = ({ navigation }: { navigation: any }) => {
	const { themeValue } = useTheme();
	const isTabletLandscape = useTabletLandscape();
	const styles = style(themeValue, isTabletLandscape);
	const [searchText, setSearchText] = useState<string>('');
	const directsOpenList = useSelector(selectDirectsOpenlist);
	const dmGroupChatList = sortDMItem(directsOpenList);
	const { t } = useTranslation(['dmMessage', 'common']);
	const clansLoadingStatus = useSelector((state: RootState) => state?.clans?.loadingStatus);
	const clans = useSelector(selectAllClans);
	const bottomSheetDMMessageRef = useRef<BottomSheetModal>(null);
	const searchInputRef = useRef(null);
	const dispatch = useAppDispatch();
	const currentDmGroupId = useSelector(selectDmGroupCurrentId)

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
		dispatch(appActions.setHiddenBottomTabMobile(true));

		return () => {
			appStateSubscription.remove();
			dispatch(appActions.setHiddenBottomTabMobile(false));
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

	const filteredDataDM = useMemo(() => {
		return dmGroupChatList?.filter?.((dm) => normalizeString(dm.channel_label || dm.usernames)?.includes(normalizeString(searchText)));
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

	const handleFriendsPress = async () => {
		await dispatch(directActions.setDmGroupCurrentId(''));
	};

	return (
		<View style={styles.containerMessages}>
			<View>
				<ServerList />
			</View>

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

				<Pressable
					onPress={handleFriendsPress}
					style={[styles.friendsWrapper, !currentDmGroupId && { backgroundColor: themeValue.secondary }]}
				>
					<Icons.FriendIcon height={size.s_20} width={size.s_20} color={themeValue.textStrong} />
					<Text style={styles.headerTitle}>{t('dmMessage:friends')}</Text>
				</Pressable>

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
						ItemSeparatorComponent={SeparatorWithSpace}
						renderItem={({ item }) => (
							<DmListItem
								directMessage={item}
								navigation={navigation}
								key={item.id}
								onLongPress={() => handleLongPress(item)}
							/>
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

			<View style={styles.containerDetailMessage}>
				{!!currentDmGroupId ? <DirectMessageDetailTablet directMessageId={currentDmGroupId} /> : <FriendsTablet navigation={navigation} />}
			</View>
		</View>
	);
};

export default MessagesScreenTablet;
