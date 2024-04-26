import React from "react";
import {Text, View} from "react-native";
import FastImage from 'react-native-fast-image'

import PlusIcon from '../../../../assets/svg/guildAddRole.svg';
import AngleDownIcon from '../../../../assets/svg/guildDropdownMenu.svg';
import HashSignIcon from '../../../../assets/svg/channelText.svg';
import SpeakerIcon from '../../../../assets/svg/speaker.svg';

export const ChannelListContext = React.createContext({} as any)
export const ServerIcon = React.memo((props: {icon?: any; data: any}) => {

    return (
        <View style={{width: '100%', alignItems: 'center', marginBottom: 10}}>
            <View style={{height: 50, width: 50, borderRadius: 50, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'grey'}}>
                {
                    props.icon ?
                    props.icon :
                    <FastImageRes uri={props.data.image} />
                }
            </View>
        </View>
    )
})

export const FastImageRes = React.memo(({uri}: {uri: string}) => {
    return (
        <FastImage
            style={{ width: '100%', height: '100%' }}
            source={{
                uri: uri,
                headers: { Authorization: 'someAuthToken' },
                priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
        />
    )
})

export const ChannelListHeader = React.memo((props: {title: string}) => {
    return (
        <View  key={Math.floor(Math.random() * 9999999).toString()} style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
            <View style={{flexDirection: 'row'}}>
                <AngleDownIcon width={16} height={16} />
                <Text style={{textTransform: 'uppercase', fontSize: 15, fontWeight: 'bold', color: '#727272'}}>
                    {props.title}
                </Text>
            </View>
            <PlusIcon width={20} height={20} />
        </View>
    )
})

export const ChannelListSection = React.memo((props: {data: any}) => {
    return (
        <View key={Math.floor(Math.random() * 9999999).toString()} style={{width: '100%', paddingHorizontal: 8, marginBottom: 20}}>
            <ChannelListHeader title={props.data.category} />
            {
                props.data.items?.map(item =>
                    <ChannelListitem data={item} />
                )
            }
        </View>
    )
})

export const ChannelListitem = React.memo((props: {data: any; image?: string;}) => {
    const useChannelListContentIn = React.useContext(ChannelListContext)

    const handleRouteData = React.useCallback(() => {
        useChannelListContentIn.navigation.closeDrawer();
    }, [])

    return (
        <View onTouchEnd={handleRouteData} key={Math.floor(Math.random() * 9999999).toString()} style={{width: '100%', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center',  paddingVertical: 8, borderRadius: 5}}>
            {
                props.image != undefined ?
                <View style={{width: 30, height: 30, borderRadius: 50, overflow: 'hidden'}}>
                    <FastImageRes uri={props.image} />
                </View>:
                props.data.type == 'voice' ?
                <SpeakerIcon width={20} height={20} />:
                <HashSignIcon width={20} height={20} />
            }
            <Text style={{fontSize: 15, marginLeft: 10, color: '#707070'}}>{props.data.title}</Text>
        </View>
    )
})

