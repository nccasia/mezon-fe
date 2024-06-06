import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { styles } from './styles';
import { useFriends } from '@mezon/core';
import { useTranslation } from 'react-i18next';
import { EAddFriendWays } from '../enum';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { AddFriendModal } from './components/AddFriendModal';
import { SeparatorWithLine } from '../../../components/Common';
import { EFriendItemAction, FriendItem } from '../../../components/FriendItem';
import { FriendsEntity } from '@mezon/store-mobile';

export const AddFriendScreen = () => {
    const { friends, acceptFriend, deleteFriend } = useFriends();
    const { t } = useTranslation('friends');
    const [currentAddFriendType, setCurrentAddFriendType] = useState<EAddFriendWays | null>(null);
    const receivedFriendRequestList = useMemo(() => {
        return friends.filter((friend) => friend.state === 2)
    }, [friends])

    const handleFriendAction = useCallback((friend: FriendsEntity, action: EFriendItemAction) => {
        switch (action) {
            case EFriendItemAction.Delete:
                deleteFriend(friend.user.username, friend.user.id);
                break;
            case EFriendItemAction.Approve:
                acceptFriend(friend.user.username, friend.user.id);
                break;
            default:
                break;
        }
    }, [acceptFriend, deleteFriend])

    const waysToAddFriendList = useMemo(() => {
        return [
            {
                title: t('addFriend.findYourFriend'),
                type: EAddFriendWays.FindFriend
            },
            {
                title: t('addFriend.addByUserName'),
                type: EAddFriendWays.UserName
            }
        ]
    }, [t]);

    return (
        <View style={styles.addFriendContainer}>
            <View style={styles.groupWrapper}>
                <FlatList
                    data={waysToAddFriendList}
                    keyExtractor={(item) => item.type.toString()}
                    ItemSeparatorComponent={SeparatorWithLine}
                    renderItem={({ item }) => (
                        <TouchableHighlight
                            onPress={() => setCurrentAddFriendType(item.type)}
                            style={styles.addFriendItem}
                            key={item.type}
                        >
                            <Text style={styles.addFriendText}>{item.title}</Text>
                        </TouchableHighlight>
                    )}
                />
            </View>
            <Text style={styles.whiteText}>{t('addFriend.incomingFriendRequest')}</Text>
            <View style={styles.groupWrapper}>
                <FlatList
                    data={receivedFriendRequestList}
                    ItemSeparatorComponent={SeparatorWithLine}
                    keyExtractor={(friend) => friend.id.toString()}
                    renderItem={({ item }) => <FriendItem friend={item} handleFriendAction={handleFriendAction} />}
                />
            </View>

            <AddFriendModal type={currentAddFriendType} onClose={() => setCurrentAddFriendType(null)} />
        </View>
    )
}