import React, { useContext } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import ChannelListComponent from '../components/chat/ChannelListComponent';
import { ChatContext } from '../context/ChatContext';
import { SocketContext } from '../context/SocketContext';
import { SOCKET_EVENT_TYPE, isEmpty } from '../utils/AppConstant';

interface ChannelListScreenProps {
    props: {
        data: any;
        renderItem?: null | undefined | any;
        headerText?: string;
        titleHeadTextPropsStyle?: StyleProp<TextStyle>;
        horizontal?: boolean;
        onPressLogout?: () => void;
        onPress?: (item: any, index: number) => void;
    };
}

export const ChannelListScreen = ({ props }: ChannelListScreenProps) => {
    const {
        data,
        headerText,
        titleHeadTextPropsStyle,
        horizontal,
        onPressLogout,
        onPress,
    } = props;
    const { state: chatState, updateSelectedChat }: any = useContext(ChatContext);
    const { state: socketState, getMessagesList }: any = useContext(SocketContext);

    const _onPress = (item: any, index: number) => {
        console.log('Component_onPress', socketState?.user?._id)
        onPress?.(item, index);
        updateSelectedChat(item);
        if (isEmpty(item?.channelId) && isEmpty(item?.members)) {
            // .. receiver user connection emit
            socketState?.socketClient.emit(SOCKET_EVENT_TYPE.JOIN_CHAT, item?.userId);
            // // .. current login user connection emit
            // socketState?.socketClient.emit(
            //   SOCKET_EVENT_TYPE.JOIN_CHAT,
            //   socketState?.user?._id,
            // );
        }

        if (!isEmpty(item?.channelId) && !isEmpty(item?.members) && item?.members?.length > 0) {
            let receiverData = item?.members?.find(
                (item: any) => item?._id != socketState?.user?._id,
            );
            // .. receiver user connection emit
            socketState?.socketClient.emit(
                SOCKET_EVENT_TYPE.JOIN_CHAT,
                receiverData?._id,
            );
            // // .. current login user connection emit
            // socketState?.socketClient.emit(
            //   SOCKET_EVENT_TYPE.JOIN_CHAT,
            //   socketState?.user?._id,
            // );
            getMessagesList(item?.channelId);
        }
    };

    return (
        <ChannelListComponent
            props={{
                data:
                    data?.length > 0
                        ? data
                        : socketState?.channelList?.length > 0
                            ? socketState?.channelList
                            : [],
                headerText: headerText,
                onPress: _onPress,
                onPressLogout: onPressLogout,
                titleHeadTextPropsStyle: titleHeadTextPropsStyle,
                horizontal: horizontal,
            }}
        />
    );
};
