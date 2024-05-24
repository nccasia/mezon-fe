import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

export const AddFriend = React.memo(() => {

    return (
        <View style={styles.addFriendContainer}>
            <Text>Add friend screen</Text>
        </View>
    )
})