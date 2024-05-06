import React from 'react';
import { FlatList, Text, View } from 'react-native';
import BarsLogo from '../../../../assets/svg/bars-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText-white.svg';
import SearchLogo from '../../../../assets/svg/discoverySearch-white.svg';
import ChatBox from './ChatBox';
import MessageBox from './MessageBox';
import WelcomeMessage from './WelcomeMessage';
import { styles } from './styles';

const HomeDefault = React.memo((props: any) => {
    const messages = [
        {
            channelId: 1,
            datetime: '4/25/2024, 10:47:00 PM',
            message: 'ssssss',
            serverId: 1,
            user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
        },
        {
            channelId: 1,
            datetime: '4/25/2024, 10:47:02 PM',
            message: 'sssss',
            serverId: 1,
            user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
        },
        {
            channelId: 1,
            datetime: '4/25/2024, 10:47:04 PM',
            message: 'ssss',
            serverId: 1,
            user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
        },
        {
            channelId: 2,
            datetime: '4/25/2024, 10:48:22 PM',
            message: 'hello',
            serverId: 1,
            user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
        },
        {
            channelId: 2,
            datetime: '4/25/2024, 10:48:25 PM',
            message: 'hi',
            serverId: 1,
            user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
        },
    ];

    return (
        <View style={[styles.homeDefault]}>
            <HomeDefaultHeader navigation={props.navigation} channelTitle={'notes-resources'} />

            <View style={{ flex: 1 }}>
                <FlatList
                    data={[{}]}
                    contentContainerStyle={styles.listChannels}
                    renderItem={() => (
                        <>
                            <WelcomeMessage uri={''} channelTitle={'notes-resources'} serverId={1} />
                            {messages
                                .filter((message) => message.channelId == 2 && message.serverId == 1)
                                .map((message) => (
                                    <MessageBox data={message} />
                                ))}
                        </>
                    )}
                />
            </View>

            <ChatBox channelTitle={'notes-resources'} channelId={2} serverId={1} />
        </View >
    );
});

const HomeDefaultHeader = React.memo(({ navigation, channelTitle }: { navigation: any; channelTitle: string }) => {
    return (
        <View
            style={styles.homeDefaultHeader}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginLeft: 14, marginRight: 8 }} onTouchEnd={() => navigation.openDrawer()}>
                    <BarsLogo width={20} height={20} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
                    <HashSignIcon width={18} height={18} />
                    <Text style={{ color: '#FFFFFF', fontFamily: 'bold', marginLeft: 10, fontSize: 16 }}>{channelTitle}</Text>
                </View>
            </View>
            <SearchLogo width={22} height={22} style={{ marginRight: 20 }} />
        </View>
    );
});

export default HomeDefault;
