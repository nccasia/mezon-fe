import { useAuth } from '@mezon/core';
import { UserGroupIcon } from '@mezon/mobile-components';
import { size } from '@mezon/mobile-ui';
import { DirectEntity, selectDirectById, selectDirectsUnreadlist } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import React, { memo } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../../../../app/navigation/ScreenTypes';
import { styles } from './styles';

const UnreadDMBadgeItem = memo(({ dm }: { dm: DirectEntity }) => {
    const navigation = useNavigation<any>();
    const currentDirect = useSelector(selectDirectById(dm?.id || ''));
    const getBadge = (dm: DirectEntity) => {
        switch (dm.type) {
            case ChannelType.CHANNEL_TYPE_DM:
                return (
                    <View style={styles.avatarWrapper}>
                        {dm?.channel_avatar?.[0] ? (
                            <Image source={{ uri: dm?.channel_avatar?.[0] }} resizeMode='cover' style={styles.groupAvatar} />
                        ) : (
                            <Text style={styles.textAvatar}>{dm?.channel_label?.charAt?.(0)}</Text>
                        )}
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{currentDirect?.count_mess_unread}</Text>
                        </View>
                    </View>
                )
            case ChannelType.CHANNEL_TYPE_GROUP:
                return (
                    <View style={styles.groupAvatar}>
                        <UserGroupIcon />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{currentDirect?.count_mess_unread}</Text>
                        </View>
                    </View>
                )
            default:
                return <View />
        }
    }

    const navigateToDirectMessageMDetail = (channel_id) => {
        navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
            screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
            params: { directMessageId: channel_id, from: APP_SCREEN.HOME },
        });
    };

    return (
        <TouchableOpacity onPress={() => navigateToDirectMessageMDetail(dm?.channel_id)} style={[styles.mb10]}>
            <View style={{ paddingHorizontal: size.s_10 }}>{getBadge(dm)}</View>
        </TouchableOpacity>
    )
})

export const UnreadDMBadgeList = React.memo(() => {
    const { userId } = useAuth();
    const unReadDirectMessageList = useSelector(selectDirectsUnreadlist);
    const unReadDM = unReadDirectMessageList.filter((dm) => dm?.last_sent_message?.sender_id !== userId)

    return (
        <View style={styles.container}>
            <ScrollView style={styles.listDMBadge} showsVerticalScrollIndicator={false}>
                {!!unReadDM?.length &&
                    unReadDM?.map((dm: DirectEntity, index) => {
                        return (
                            <UnreadDMBadgeItem key={dm?.id} dm={dm} />
                        );
                    })}
            </ScrollView>
        </View>
    );
});
