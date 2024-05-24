import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Images from 'apps/mobile/src/assets/Images'
import Entypo from 'react-native-vector-icons/Entypo'
import Feather from 'react-native-vector-icons/Feather'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { styles } from './styles'
import { useRef } from 'react'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetHandle,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useMemo } from 'react'
import { useCallback } from 'react'
import SearchInput from '../../components/SearchInput'
import { useAuth } from '@mezon/core'
import FastImage from 'react-native-fast-image'
import { APP_SCREEN } from '../../navigation/ScreenTypes'
import Toast from "react-native-toast-message";
const friendData = [
    {
        image: 'https://gcs.tripi.vn/public-tripi/tripi-feed/img/474053MSU/anh-cute-nguoi-that-dep-nhat_022606213.jpg',
        name: 'Alice',
        isOnline: true
    },
    {
        image: 'https://gcs.tripi.vn/public-tripi/tripi-feed/img/474053MSU/anh-cute-nguoi-that-dep-nhat_022606213.jpg',
        name: 'Bob',
        isOnline: false
    },
    {
        image: 'https://gcs.tripi.vn/public-tripi/tripi-feed/img/474053MSU/anh-cute-nguoi-that-dep-nhat_022606213.jpg',
        name: 'Charlie',
        isOnline: true
    },
    {
        image: 'https://gcs.tripi.vn/public-tripi/tripi-feed/img/474053MSU/anh-cute-nguoi-that-dep-nhat_022606213.jpg',
        name: 'David',
        isOnline: false
    },
    {
        image: 'https://cdn.tgdd.vn/Files/2023/07/10/1537629/cachkhacphucloitaianh4x6lenhochieuonline-130723-145414-800-resize.jpg',
        name: 'Anna',
        isOnline: true
    },
    {
        image: 'https://cdn.tgdd.vn/Files/2023/07/10/1537629/cachkhacphucloitaianh4x6lenhochieuonline-130723-145414-800-resize.jpg',
        name: 'Andrew',
        isOnline: false
    },
    {
        image: 'https://cdn.tgdd.vn/Files/2023/07/10/1537629/cachkhacphucloitaianh4x6lenhochieuonline-130723-145414-800-resize.jpg',
        name: 'Catherine',
        isOnline: true
    },
    {
        image: 'https://cdn.tgdd.vn/Files/2023/07/10/1537629/cachkhacphucloitaianh4x6lenhochieuonline-130723-145414-800-resize.jpg',
        name: 'Daniel',
        isOnline: false
    },
    {
        image: 'https://cdn.tgdd.vn/Files/2023/07/10/1537629/cachkhacphucloitaianh4x6lenhochieuonline-130723-145414-800-resize.jpg',
        name: 'Claire',
        isOnline: true
    },
    {
        image: 'https://cdn.tgdd.vn/Files/2023/07/10/1537629/cachkhacphucloitaianh4x6lenhochieuonline-130723-145414-800-resize.jpg',
        name: 'Dylan',
        isOnline: false
    }
];

const ProfileScreen = ({ navigation }: { navigation: any }) => {
    const user = useAuth();
    console.log('user:', user);
    const [text, setText] = React.useState<string>('');
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['50%', '98%'], []);

    // callbacks
    const handlePresentModalPress = () => {
        navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.HOME });
    };
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const CustomBottomSheetHandle = () => (
        <BottomSheetHandle style={styles.container_customBottomSheet} >
            <Text style={styles.textBold}>Friends</Text>
            <Text style={styles.textBold}>Add Friend</Text>
        </BottomSheetHandle>
    );
    const sortedAndGroupedFriends = friendData.reduce((acc, friend) => {
        const firstLetter = friend.name.charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(friend);
        return acc;
    }, {});

    const navigateToSettingScreen = () => {
		navigation.navigate(APP_SCREEN.PROFILE.STACK, { screen: APP_SCREEN.PROFILE.SETTING });
	};

    return (
        <BottomSheetModalProvider>
            <View style={styles.container}>
                <View style={styles.containerBackground}>
                    <View style={styles.backgroundListIcon}>
                        <TouchableOpacity style={styles.backgroundSetting} onPress={() => navigateToSettingScreen()}>
                            <Feather name='settings' size={20} style={styles.icon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.viewImageProfile}>
                        {user?.userProfile?.user?.avatar_url ? (
                            <FastImage
                                style={[{ width: '100%', height: '100%', borderRadius: 50 }]}
                                source={{
                                    uri: user?.userProfile?.user?.avatar_url,
                                    headers: { Authorization: 'someAuthToken' },
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        ): <Text style={styles.textAvatar}>{user?.userProfile?.user?.username?.charAt?.(0)}</Text>}
                        <View style={styles.dotOnline} />
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <TouchableOpacity style={styles.viewInfo}>
                        <Text style={styles.textName}>{user?.userProfile?.user?.username}</Text>
                        <Feather name="chevron-down" style={styles.icon} />
                    </TouchableOpacity>
                    <Text style={styles.text}>{user?.userProfile?.user?.username}</Text>
                    <View style={styles.buttonList}>
                        <TouchableOpacity style={styles.viewButton} onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })}>
                            <Feather name="message-circle" size={20} style={styles.icon} />
                            <Text style={styles.textBold}>Add status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.viewButton} onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })}>
                            <MaterialIcons style={styles.icon} name="edit" size={20} />
                            <Text style={styles.textBold}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={styles.memberView}>
                    <Text style={styles.text}>Mezon Member Since</Text>
                    <Text style={styles.text}>Jan 26, 2024</Text>
                </View>
                <TouchableOpacity style={styles.viewFriend} onPress={handlePresentModalPress}>
                    <Text style={styles.text}>Your friends</Text>
                    <View style={styles.listImageFriend}>
                        <Image source={Images.ANH} style={styles.imageFriend} />
                        <Image source={Images.ANH} style={styles.imageFriend} />
                        <Image source={Images.ANH} style={styles.imageFriend} />
                        <Feather name="chevron-right" size={20} style={styles.icon} />
                    </View>
                </TouchableOpacity>
                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}

                    handleComponent={(props) => (
                        <CustomBottomSheetHandle {...props} />
                    )}
                >
                    <BottomSheetScrollView style={styles.containerListFriend}>
                        <View style={{ width: '100%', height: 50 }}>
                            <SearchInput placeholder='Search' text={text} setText={setText} />
                        </View>
                        <ScrollView>
                            {Object.entries(sortedAndGroupedFriends).map(([letter, friends]) => (
                                <View key={letter}>
                                    <Text style={styles.text}>{letter}</Text>
                                    {friends.map(friend => (
                                        <View key={friend.name} style={styles.boxFriendContainer}>
                                            <View style={styles.listFriendGroup}>
                                                <View style={styles.boxFriend}>
                                                    <View style={styles.ViewImagefriend}>
                                                        <Image source={{ uri: friend.image }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                                                        {friend.isOnline ? <View style={styles.dotOnlineFriend} /> :
                                                            <View style={styles.dotOfflineFriend} />}
                                                    </View>
                                                    <View style={{}}>
                                                        <Text style={styles.textBold}>{friend.name}</Text>
                                                        <Text style={styles.text}>Chilling</Text>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row', gap: 15 }}>
                                                    <TouchableOpacity>
                                                        <Feather name="phone-call" size={20} style={styles.icon} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity>
                                                        <Feather name="message-circle" size={20} style={styles.icon} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>
                    </BottomSheetScrollView>
                </BottomSheetModal>
            </View>
        </BottomSheetModalProvider>
    )
}

export default ProfileScreen
