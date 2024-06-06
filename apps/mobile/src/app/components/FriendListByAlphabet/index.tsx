import React, { useMemo, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { styles } from "./styles";
import { FriendsEntity } from "@mezon/store-mobile";
import { SeparatorWithLine, SeparatorWithSpace } from "../Common";
import { FriendItem } from "../FriendItem";
import { useTranslation } from "react-i18next";
import { IFriendGroupByCharacter, IListUserByAlphabetProps } from "./type";
import { useCallback } from "react";

export const FriendListByAlphabet = React.memo((props: IListUserByAlphabetProps) => {
    const { friendList, isSearching, showAction, selectMode, handleFriendAction, onSelectedChange } = props;
    const [ friendIdSelectedList, setFriendIdSelectedList ] = useState<string[]>([]);
    const { t } = useTranslation(['friends']);

    const onSelectChange = useCallback((friend: FriendsEntity, value: boolean) => {
        let newValue: string[] = [];
        if (value) {
            newValue = [...friendIdSelectedList, friend.user.id];
        } else {
            newValue = friendIdSelectedList.filter(friendId => friend.user.id !== friendId);
        }
        setFriendIdSelectedList(newValue)
        onSelectedChange(newValue)
    }, [friendIdSelectedList, onSelectedChange]);

    const sortByAlphabet = (a, b) => {
        if (a.character < b.character) {
            return -1;
        }
        if (a.character > b.character) {
            return 1;
        }
        return 0;
    }

    const allFriendGroupByAlphabet = useMemo(() => {
        const groupedByCharacter = friendList.reduce((acc, friend) => {
            const name = showAction ?  friend.user.username : friend.user.display_name;
            const firstNameCharacter = name.charAt(0).toUpperCase();
            if (!acc[firstNameCharacter]) {
                acc[firstNameCharacter] = [];
            }
            acc[firstNameCharacter].push(friend);
            return acc;
        }, {})

        return Object.keys(groupedByCharacter).map((character) => ({
            character,
            friendList: groupedByCharacter[character]
        })).sort(sortByAlphabet);
    }, [friendList, showAction]);

    const renderListFriendGroupByAlphabet = ({ item }: { item: IFriendGroupByCharacter }) => {
        return (
            <View>
                <Text style={styles.groupFriendTitle}>{item.character}</Text>
                <View style={styles.groupWrapper}>
                    <FlatList
                        data={item.friendList}
                        style={styles.groupByAlphabetWrapper}
                        ItemSeparatorComponent={SeparatorWithLine}
                        keyExtractor={(friend) => friend.id.toString()}
                        renderItem={({ item }) => <FriendItem
                            friend={item}
                            showAction={showAction}
                            selectMode={selectMode}
                            isChecked={friendIdSelectedList.includes(item.user.id)}
                            handleFriendAction={handleFriendAction}
                            onSelectChange={onSelectChange}
                        />}
                    />
                </View>
            </View>
        )
    }
    return (
        <View style={styles.listUserByAlphabetContainer}>
            {isSearching ? (
                <View>
                    {friendList.length ? (
                        <Text style={styles.friendText}>{t('friends:friends')}</Text>
                    ): null}
                    <View style={styles.groupWrapper}>
                        <FlatList
                            data={friendList}
                            keyExtractor={(friend) => friend.id.toString()}
                            ItemSeparatorComponent={SeparatorWithLine}
                            renderItem={({ item }) => <FriendItem
                                friend={item}
                                showAction={showAction}
                                selectMode={selectMode}
                                isChecked={friendIdSelectedList.includes(item.user.id)}
                                handleFriendAction={handleFriendAction}
                                onSelectChange={onSelectChange}
                            />}
                        />
                    </View>
                </View>
            ): (
                <FlatList
                    data={allFriendGroupByAlphabet}
                    keyExtractor={(item) => item.character}
                    ItemSeparatorComponent={SeparatorWithSpace}
                    renderItem={renderListFriendGroupByAlphabet}
			    />
            )}
        </View>
    )
})