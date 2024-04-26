import React from "react";
import {Text, View} from "react-native";

import HashSignIcon from '../../../../assets/svg/channelText-white.svg';
import EditIconBlue from '../../../../assets/svg/guildEditServerProfile-blue.svg';

import { FastImageRes } from './Reusables';

const WelcomeMessage = React.memo((props: {channelTitle: string; serverId?: number; uri?: string}) => {
    return (
        <View style={{paddingHorizontal: 10, marginBottom: 30}}>
            <View style={{backgroundColor: 'rgb(80,80,80)', marginBottom: 10, width: 70, height: 70, borderRadius: 50, alignItems: 'center', justifyContent: 'center'}}>
                {
                    props.uri ?
                    <View style={{width: 50, height: 50}}>
                        <FastImageRes uri={props.uri} />
                    </View>:
                    <HashSignIcon width={50} height={50} />
                }
            </View>
            <View style={{}}>
                <Text style={{fontSize: 22,marginBottom: 10, color: '#FFFFFF', fontFamily: 'bold'}}>
                    {props.serverId === 0 ? props.channelTitle : "Welcome to #" + props.channelTitle}
                </Text>
                <Text style={{fontSize: 14, color: '#FFFFFF', marginBottom: 10,}}>
                    {props.serverId === 0 ? "This is the very beginning of your legandary conversation with " + props.channelTitle : "This is the start of the #" + props.channelTitle}
                </Text>
            </View>

            {
                props.serverId !== 0 &&
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <EditIconBlue width={20} height={20} />
                    <Text style={{color: '#3276c4', marginLeft: 10}}>Edit Channel</Text>
                </View>
            }

        </View>
    )
})

export default WelcomeMessage;
