import { UserGroupIcon } from '@mezon/mobile-components';
import { DirectEntity, selectDirectsUnreadlist } from '@mezon/store-mobile';
import { ChannelType } from 'mezon-js';
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { APP_SCREEN } from '../../../../../../app/navigation/ScreenTypes';
import { size } from '@mezon/mobile-ui';

export const UnreadDMBadgeList = React.memo(() => {
    const unReadDirectMessageList = useSelector(selectDirectsUnreadlist);
    const navigation = useNavigation<any>();

    const getBadge = (dm: DirectEntity) => {
        switch (dm.type) {
            case ChannelType.CHANNEL_TYPE_DM:
                return (
                    <View>
                        <Image source={{uri: dm?.channel_avatar?.[0]}} resizeMode='cover' style={styles.groupAvatar} />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{dm?.count_mess_unread}</Text>
                        </View>
                    </View>
                )
            case ChannelType.CHANNEL_TYPE_GROUP:
                return (
                    <View style={styles.groupAvatar}>
                        <UserGroupIcon />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{dm?.count_mess_unread}</Text>
                        </View>
                    </View>
                )
            default:
                return <View />
        }
    }

    const navigateToDirectMessageMDetail = (channel_id) => {
        navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL, params: { directMessageId: channel_id, from: APP_SCREEN.HOME } })
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.listDMBadge} showsVerticalScrollIndicator={false}>
                {!!unReadDirectMessageList?.length && unReadDirectMessageList?.map((dm: DirectEntity, index) => {
                    return (
                        <TouchableOpacity key={dm.id} onPress={() => navigateToDirectMessageMDetail(dm?.channel_id)} style={[styles.mb10]}>
                            <View style={{paddingHorizontal: size.s_10}}>
                                {getBadge(dm)}
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </View>
    )
})
