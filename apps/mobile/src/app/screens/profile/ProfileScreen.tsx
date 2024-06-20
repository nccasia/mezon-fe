import { Text, TouchableOpacity, View, Image, ScrollView } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import { styles } from './styles'
import { useMemo } from 'react'
import { useAuth, useFriends } from '@mezon/core'
import { APP_SCREEN } from '../../navigation/ScreenTypes'
import Toast from "react-native-toast-message";
import { useMixImageColor } from '../../hooks/useMixImageColor'
import { ChevronIcon, MessageIcon, PenIcon } from '@mezon/mobile-components'
import { FriendsEntity } from '@mezon/store-mobile'
import moment from 'moment'
import { MezonButton } from '../../temp-ui'
import { size } from '@mezon/mobile-ui'
import { useTranslation } from 'react-i18next'

const ProfileScreen = ({ navigation }: { navigation: any }) => {
    const user = useAuth();
    const { friends: allUser } = useFriends();
    const { color } = useMixImageColor(user?.userProfile?.user?.avatar_url);
    const { t } = useTranslation('profile');

    const friendList: FriendsEntity[] = useMemo(() => {
        return allUser.filter((user) => user.state === 0)
    }, [allUser]);

    const navigateToFriendScreen = () => {
        navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.HOME });
    };
    const navigateToSettingScreen = () => {
        navigation.navigate(APP_SCREEN.SETTINGS.STACK, { screen: APP_SCREEN.SETTINGS.HOME });
    };

    const navigateToProfileSetting = () => {
        navigation.navigate(APP_SCREEN.SETTINGS.STACK, { screen: APP_SCREEN.SETTINGS.PROFILE });
    }

    const firstFriendImageList = useMemo(() => {
        return friendList.slice(0, 5).map(friend => friend.user.avatar_url)
    }, [friendList])

    const memberSince = useMemo(() => {
        return moment(user?.userProfile?.user?.create_time).format('MMM DD, YYYY');
    }, [user])

    return (
        <View style={styles.container}>
            <View style={[styles.containerBackground, { backgroundColor: color }]}>
                <View style={styles.backgroundListIcon}>
                    <TouchableOpacity style={styles.backgroundSetting} onPress={() => navigateToSettingScreen()}>
                        <Feather name='settings' size={20} style={styles.iconColor} />
                    </TouchableOpacity>
                </View>

                <View style={styles.viewImageProfile}>
                    {user?.userProfile?.user?.avatar_url ? (
                        <Image source={{ uri: user?.userProfile?.user?.avatar_url }} style={styles.imgWrapper} />
                    ) : <Text style={styles.textAvatar}>{user?.userProfile?.user?.username?.charAt?.(0)}</Text>}
                    <View style={styles.dotOnline} />
                </View>
            </View>

            <ScrollView style={styles.contentWrapper}>
                <View style={styles.contentContainer}>
                    <TouchableOpacity style={styles.viewInfo} onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })}>
                        <Text style={styles.textName}>{user?.userProfile?.user?.display_name}</Text>
                        <Feather name="chevron-down" style={styles.iconColor} />
                    </TouchableOpacity>

                    <Text style={styles.text}>{user?.userProfile?.user?.username}</Text>

                    <View style={styles.buttonList}>
                        <MezonButton viewContainerStyle={styles.button} onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })}>
                            <MessageIcon width={25} height={17}/>
                            <Text style={styles.whiteText}>{t('addStatus')}</Text>
                        </MezonButton>

                        <MezonButton viewContainerStyle={styles.button} onPress={() => navigateToProfileSetting()}>
                            <PenIcon width={25} height={17} />
                            <Text style={styles.whiteText}>{t('editStatus')}</Text>
                        </MezonButton>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <View style={{gap: size.s_20}}>
                        {user?.userProfile?.user?.about_me ? (
                            <View>
                                <Text style={styles.text}>{t('aboutMe')}</Text>
                                <Text style={styles.whiteText}>{user?.userProfile?.user?.about_me}</Text>
                            </View>
                        ): null}

                        <View>
                            <Text style={styles.text}>{t('mezonMemberSince')}</Text>
                            <Text style={styles.whiteText}>{memberSince}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.contentContainer, styles.imgList]} onPress={() => navigateToFriendScreen()}>
                    <Text style={styles.text}>{t('yourFriend')}</Text>
                    <View style={styles.listImageFriend}>
                        {firstFriendImageList.map((imgUrl, idx) => {
                            return (
                                <View key={idx} style={[styles.imageContainer, { right: idx * 20 }]}>
                                    <Image source={{uri: imgUrl}} style={styles.imageFriend} />
                                </View>
                            )
                        })}
                    </View>
                    <ChevronIcon width={16} height={16} style={{marginLeft: size.s_4}} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

export default ProfileScreen
