import React from "react";
import {Text, View} from "react-native";
import { FastImageRes } from "./Reusables";

const MessageBox = React.memo((props: {data: any}) => {

    return (
        <View key={Math.floor(Math.random() * 9999999).toString()} style={{flexDirection: 'row', paddingHorizontal: 10, marginBottom: 25, alignItems: 'center'}}>
            <View style={{width: 40, height: 40, borderRadius: 50, overflow: 'hidden'}}>
                <FastImageRes uri={props.data.user_details.image} />
            </View>
            <View style={{marginLeft: 15, justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5}}>
                    <Text style={{fontSize: 17, marginRight: 10, color: '#dcdcdc'}}>
                        {props.data.user_details.name}
                    </Text>
                    <Text style={{fontSize: 12, color: '#b4b4b4'}}>{props.data.datetime}</Text>
                </View>
                <View>
                    <Text style={{fontSize: 15, color: '#dcdcdc'}}>{props.data.message}</Text>
                </View>
            </View>
        </View>
    )
})

export default MessageBox;
