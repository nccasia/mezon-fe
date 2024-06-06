import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { styles } from './styles';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@mezon/mobile-ui';
import { useTranslation } from 'react-i18next';
import { useThrottledCallback } from 'use-debounce';
import { useDirect, useFriends } from '@mezon/core';
import { normalizeString } from '../../utils/helpers';
import { ChevronIcon, PaperPlaneIcon } from '@mezon/mobile-components';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { FriendListByAlphabet } from '../../components/FriendListByAlphabet';
import { FriendsEntity } from '@mezon/store-mobile';
import { EFriendItemAction } from '../../components/FriendItem';

export const FriendScreen = React.memo(({ navigation }: { navigation: any }) => {
    const [searchText, setSearchText] = useState<string>('');
    const { t } = useTranslation(['common', 'friends']);
    const { friends: allUser } = useFriends();
    const { createDirectMessageWithUser, listDM } = useDirect();
    const friendList: FriendsEntity[] = useMemo(() => {
        return allUser.filter((user) => user.state === 0)
    }, [allUser]);

    const navigateToRequestFriendScreen = () => {
        navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.REQUEST_FRIEND })
    }

    const filteredFriendList = useMemo(() => {
        return friendList.filter(friend => normalizeString(friend.user.username).includes(normalizeString(searchText)));
    }, [friendList, searchText]);

    const friendRequestCount = useMemo(() => {
        return {
            sent: allUser.filter(user => user.state === 1).length,
            received: allUser.filter(user => user.state === 2).length,
        }
    }, [allUser]);

    const directMessageWithUser = useCallback(async (userId: string) => {
        const directMessage = listDM.find(dm => dm?.user_id?.length === 1 && dm?.user_id[0] === userId);
        if (directMessage?.id) {
            navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL, params: { directMessageId: directMessage?.id } });
            return;
        }
		const response = await createDirectMessageWithUser(userId);
		if (response?.channel_id) {
            navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL, params: { directMessageId: response?.channel_id } });
		}
	}, [createDirectMessageWithUser, listDM, navigation]);

    const handleFriendAction = useCallback((friend: FriendsEntity, action: EFriendItemAction) => {
        switch (action) {
            case EFriendItemAction.Call:
                console.log('handle phone call', friend);
                break;
            case EFriendItemAction.MessageDetail:
                directMessageWithUser(friend?.user?.id)
                break;
            default:
                break;
        }
    }, [directMessageWithUser])

    const typingSearchDebounce = useThrottledCallback((text) => setSearchText(text), 500)

    return (
        <View style={styles.friendContainer}>
            <View style={styles.searchFriend}>
				<Feather size={18} name="search" style={{ color: Colors.tertiary }} />
				<TextInput
					placeholder={t('common:searchPlaceHolder')}
					placeholderTextColor={Colors.tertiary}
					style={styles.searchInput}
					onChangeText={(text) => typingSearchDebounce(text)}
				/>
			</View>

            {filteredFriendList.length === 0 ? (
                <View>
                    <Text style={styles.defaultText}>{t('friends:noFriendsResultsFound')}</Text>
                </View>
            ): null}

            {!searchText.trim().length || filteredFriendList.length === 0 ? (
                <Pressable style={styles.requestFriendWrapper} onPress={() => navigateToRequestFriendScreen()}>
                    <PaperPlaneIcon width={25} color={Colors.textGray} />
                    <View style={styles.fill}>
                        <Text style={styles.defaultText}>{t('friends:friendRequest.title')}</Text>
                        <View style={styles.requestContentWrapper}>
                            <Text style={styles.defaultText}>{friendRequestCount.received} {t('friends:friendRequest.received')}</Text>
                            <Text style={styles.defaultText}>•</Text>
                            <Text style={styles.defaultText}>{friendRequestCount.sent} {t('friends:friendRequest.sent')}</Text>
                        </View>
                    </View>
                    <ChevronIcon width={25} color={Colors.textGray} />
                </Pressable>
            ): null}
            <FriendListByAlphabet
                isSearching={Boolean(searchText.trim().length)}
                friendList={filteredFriendList}
                handleFriendAction={handleFriendAction}
                showAction={true}
            />
        </View>
    )
})