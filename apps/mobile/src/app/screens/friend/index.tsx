import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

export const FriendScreen = React.memo(({ navigation }: { navigation: any }) => {

    return (
        <View style={styles.friendContainer}>
            <Text>friend screen</Text>
        </View>
    )
})